<?php

namespace App\Infrastructure\Service;

use App\Application\DTO\ModelDTO;
use App\Application\DTO\NodeDTO;
use App\Application\Service\ModelServiceInterface;
use App\Repository\ArchitectureRepository;
use App\Repository\CapabilityRepository;
use App\Repository\PipelineRepository;
use App\Repository\ProcessRepository;
use App\Repository\ProductRepository;
use App\Repository\TeamRepository;
use App\Repository\ValuestreamRepository;

class ModelService implements ModelServiceInterface
{
    public function __construct(
        private ProductRepository $productRepository,
        private ValuestreamRepository $valuestreamRepository,
        private CapabilityRepository $capabilityRepository,
        private ArchitectureRepository $architectureRepository,
        private TeamRepository $teamRepository,
        private PipelineRepository $pipelineRepository,
        private ProcessRepository $processRepository
    ) {
    }

    public function getModel(): ModelDTO
    {
        $nodes = [];

        // Add products
        $products = $this->productRepository->findAll();
        foreach ($products as $product) {
            $relations = [];
            foreach ($product->getValuestreams() as $valuestream) {
                $relations[] = [
                    'type' => 'valuestream',
                    'id' => $valuestream->getExternalId()
                ];
            }

            $nodes[] = new NodeDTO(
                $product->getExternalId(),
                $product->getName(),
                $product->getDescription(),
                'product',
                null,
                $relations
            );
        }

        // Add valuestreams
        $valuestreams = $this->valuestreamRepository->findAll();
        foreach ($valuestreams as $valuestream) {
            $nodes[] = new NodeDTO(
                $valuestream->getExternalId(),
                $valuestream->getName(),
                $valuestream->getDescription(),
                'valuestream'
            );
        }

        // Add capabilities
        $capabilities = $this->capabilityRepository->findAll();
        $processToTeams = $this->getProcessNameToTeamIDs();
        
        foreach ($capabilities as $capability) {
            $relations = [];
            
            // Add valuestream relations
            foreach ($capability->getValuestreams() as $valuestream) {
                $relations[] = [
                    'type' => 'valuestream',
                    'id' => $valuestream->getExternalId()
                ];
            }

            // Add team relations based on processes
            $seenTeams = [];
            foreach ($capability->getProcesses() as $process) {
                $processName = $process->getName();
                foreach ($processToTeams[$processName] ?? [] as $teamID) {
                    if (!isset($seenTeams[$teamID])) {
                        $seenTeams[$teamID] = true;
                        $relations[] = [
                            'type' => 'team',
                            'id' => $teamID
                        ];
                    }
                }
            }

            $nodes[] = new NodeDTO(
                $capability->getExternalId(),
                $capability->getName(),
                $capability->getDescription(),
                'capability',
                $capability->getParent()?->getExternalId(),
                $relations
            );
        }

        // Add architecture
        $architectures = $this->architectureRepository->findAll();
        foreach ($architectures as $architecture) {
            $relations = [];
            
            // Architecture is connected through processes
            foreach ($architecture->getProcesses() as $process) {
                $relations[] = [
                    'type' => 'process',
                    'id' => $process->getExternalId()
                ];
            }

            $nodes[] = new NodeDTO(
                $architecture->getExternalId(),
                $architecture->getName(),
                $architecture->getDescription(),
                'architecture',
                null,
                $relations
            );
        }

        // Add teams
        $teams = $this->teamRepository->findAll();
        foreach ($teams as $team) {
            $relations = [];
            
            // Teams are connected through processes
            foreach ($team->getProcesses() as $process) {
                $relations[] = [
                    'type' => 'process',
                    'id' => $process->getExternalId()
                ];
            }
            
            // Teams are also connected to capabilities
            foreach ($team->getCapabilities() as $capability) {
                $relations[] = [
                    'type' => 'capability',
                    'id' => $capability->getExternalId()
                ];
            }

            $nodes[] = new NodeDTO(
                $team->getExternalId(),
                $team->getName(),
                $team->getDescription(),
                'team',
                null,
                $relations
            );
        }

        // Add pipelines
        $pipelines = $this->pipelineRepository->findAll();
        foreach ($pipelines as $pipeline) {
            $relations = [];
            foreach ($pipeline->getRelations() as $relation) {
                $relations[] = [
                    'type' => $relation['type'],
                    'id' => $relation['id']
                ];
            }

            $nodes[] = new NodeDTO(
                $pipeline->getExternalId(),
                $pipeline->getName(),
                $pipeline->getDescription(),
                'pipeline',
                null,
                $relations
            );
        }

        // Add processes
        $processes = $this->processRepository->findAll();
        foreach ($processes as $process) {
            $relations = [];
            
            // Processes are connected to products
            foreach ($process->getProducts() as $product) {
                $relations[] = [
                    'type' => 'product',
                    'id' => $product->getExternalId()
                ];
            }

            $nodes[] = new NodeDTO(
                $process->getExternalId(),
                $process->getName(),
                $process->getDescription(),
                'process',
                null,
                $relations
            );
        }

        return new ModelDTO($nodes);
    }

    public function getProducts(): array
    {
        $products = $this->productRepository->findAll();
        $result = ['products' => []];

        foreach ($products as $product) {
            $productData = [
                'id' => $product->getExternalId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'relations' => []
            ];

            foreach ($product->getValuestreams() as $valuestream) {
                $productData['relations'][] = [
                    'type' => 'valuestream',
                    'id' => $valuestream->getExternalId(),
                    'name' => $valuestream->getName(),
                    'description' => $valuestream->getDescription()
                ];
            }

            $result['products'][] = $productData;
        }

        return $result;
    }

    public function getCapabilities(): array
    {
        $capabilities = $this->capabilityRepository->findAll();
        $result = ['capabilities' => []];

        foreach ($capabilities as $capability) {
            $capabilityData = [
                'id' => $capability->getExternalId(),
                'name' => $capability->getName(),
                'description' => $capability->getDescription(),
                'valuestreams' => [],
                'processes' => []
            ];

            foreach ($capability->getValuestreams() as $valuestream) {
                $capabilityData['valuestreams'][] = $valuestream->getExternalId();
            }

            foreach ($capability->getProcesses() as $process) {
                $capabilityData['processes'][] = $process->getName();
            }

            $result['capabilities'][] = $capabilityData;
        }

        return $result;
    }

    public function getTeams(): array
    {
        $teams = $this->teamRepository->findAll();
        $result = ['teams' => []];

        foreach ($teams as $team) {
            $teamData = [
                'id' => $team->getExternalId(),
                'name' => $team->getName(),
                'description' => $team->getDescription(),
                'processes' => []
            ];

            foreach ($team->getProcesses() as $process) {
                $teamData['processes'][] = $process->getName();
            }

            $result['teams'][] = $teamData;
        }

        return $result;
    }

    public function getArchitecture(): array
    {
        $architectures = $this->architectureRepository->findAll();
        $result = ['architecture' => []];

        foreach ($architectures as $architecture) {
            $architectureData = [
                'id' => $architecture->getExternalId(),
                'name' => $architecture->getName(),
                'description' => $architecture->getDescription(),
                'relations' => []
            ];

            foreach ($architecture->getComponents() as $component) {
                $architectureData['relations'][] = [
                    'type' => 'architecture',
                    'id' => $component->getExternalId()
                ];
            }

            $result['architecture'][] = $architectureData;
        }

        return $result;
    }

    public function getPipelines(): array
    {
        $pipelines = $this->pipelineRepository->findAll();
        $result = ['pipelines' => []];

        foreach ($pipelines as $pipeline) {
            $pipelineData = [
                'id' => $pipeline->getExternalId(),
                'name' => $pipeline->getName(),
                'description' => $pipeline->getDescription(),
                'relations' => []
            ];

            foreach ($pipeline->getRelations() as $relation) {
                $pipelineData['relations'][] = [
                    'type' => $relation['type'],
                    'id' => $relation['id']
                ];
            }

            $result['pipelines'][] = $pipelineData;
        }

        return $result;
    }

    public function getValuestreams(): array
    {
        $valuestreams = $this->valuestreamRepository->findAll();
        $result = ['valuestreams' => []];

        foreach ($valuestreams as $valuestream) {
            $result['valuestreams'][] = [
                'id' => $valuestream->getExternalId(),
                'name' => $valuestream->getName(),
                'description' => $valuestream->getDescription()
            ];
        }

        return $result;
    }

    public function getProcesses(): array
    {
        $processes = $this->processRepository->findAll();
        $result = ['processes' => []];

        foreach ($processes as $process) {
            $processData = [
                'id' => $process->getExternalId(),
                'name' => $process->getName(),
                'description' => $process->getDescription(),
                'relations' => []
            ];

            // Processes are connected to products
            foreach ($process->getProducts() as $product) {
                $processData['relations'][] = [
                    'type' => 'product',
                    'id' => $product->getExternalId()
                ];
            }

            $result['processes'][] = $processData;
        }

        return $result;
    }

    private function getProcessNameToTeamIDs(): array
    {
        $teams = $this->teamRepository->findAll();
        $out = [];

        foreach ($teams as $team) {
            $teamID = $team->getExternalId();
            foreach ($team->getProcesses() as $process) {
                $processName = $process->getName();
                if (!isset($out[$processName])) {
                    $out[$processName] = [];
                }
                $out[$processName][] = $teamID;
            }
        }

        return $out;
    }
}
