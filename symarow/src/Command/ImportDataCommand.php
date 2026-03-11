<?php

namespace App\Command;

use App\Entity\Architecture;
use App\Entity\Capability;
use App\Entity\Pipeline;
use App\Entity\Process;
use App\Entity\Product;
use App\Entity\Team;
use App\Entity\Valuestream;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:import-data',
    description: 'Imports data from JSON files into the database',
)]
class ImportDataCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            // Import products
            $this->importProducts();
            $this->entityManager->flush();
            $this->entityManager->clear();
            $io->success('Products imported successfully');

            // Import valuestreams
            $this->importValuestreams();
            $this->entityManager->flush();
            $this->entityManager->clear();
            $io->success('Valuestreams imported successfully');

            // Import capabilities
            $this->importCapabilities();
            $this->entityManager->flush();
            $this->entityManager->clear();
            $io->success('Capabilities imported successfully');

            // Import architecture
            $this->importArchitecture();
            $this->entityManager->flush();
            $this->entityManager->clear();
            $io->success('Architecture imported successfully');

            // Import teams
            $this->importTeams();
            $this->entityManager->flush();
            $this->entityManager->clear();
            $io->success('Teams imported successfully');

            // Import pipelines
            $this->importPipelines();
            $this->entityManager->flush();
            $this->entityManager->clear();
            $io->success('Pipelines imported successfully');

            // Import processes
            $this->importProcesses();
            $this->entityManager->flush();
            $this->entityManager->clear();
            $io->success('Processes imported successfully');

            $io->success('All data imported successfully!');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Error importing data: ' . $e->getMessage());
            $io->error('Trace: ' . $e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    private function loadJsonData(string $filename): array
    {
        $path = $this->getProjectDir() . '/assets/data/' . $filename;

        if (!file_exists($path)) {
            throw new \RuntimeException(sprintf('Data file "%s" not found at: %s', $filename, $path));
        }

        $content = file_get_contents($path);
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException(sprintf('Invalid JSON in file "%s".', $filename));
        }

        return $data;
    }

    private function getProjectDir(): string
    {
        return dirname(__DIR__, 2);
    }

    private function importProducts(): void
    {
        $data = $this->loadJsonData('products.json');

        foreach ($data['products'] ?? [] as $productData) {
            $product = new Product();
            $product->setExternalId($productData['id']);
            $product->setName($productData['name']);
            $product->setDescription($productData['description']);

            // Add valuestreams (we'll set them after importing valuestreams)
            $this->entityManager->persist($product);
        }

        $this->entityManager->flush();

        // Now set the valuestream relationships
        foreach ($data['products'] ?? [] as $productData) {
            $product = $this->entityManager->getRepository(Product::class)->findOneBy(['externalId' => $productData['id']]);
            if (!$product) continue;

            foreach ($productData['relations'] ?? [] as $relation) {
                if ($relation['type'] === 'valuestream') {
                    $valuestream = $this->entityManager->getRepository(Valuestream::class)->findOneBy(['externalId' => $relation['id']]);
                    if ($valuestream) {
                        $product->addValuestream($valuestream);
                    }
                }
            }
        }
    }

    private function importValuestreams(): void
    {
        $data = $this->loadJsonData('valuestreams.json');

        foreach ($data['valuestreams'] ?? [] as $valuestreamData) {
            $valuestream = new Valuestream();
            $valuestream->setExternalId($valuestreamData['id']);
            $valuestream->setName($valuestreamData['name']);
            $valuestream->setDescription($valuestreamData['description']);

            $this->entityManager->persist($valuestream);
        }

        $this->entityManager->flush();
    }

    private function importCapabilities(): void
    {
        $data = $this->loadJsonData('capabilities.json');
        
        // First, create a map of process names to process entities
        $processMap = [];
        $processes = $this->entityManager->getRepository(Process::class)->findAll();
        foreach ($processes as $process) {
            $processMap[$process->getName()] = $process;
        }

        // First pass: create all capabilities
        $capabilityMap = [];
        foreach ($data['capabilities'] ?? [] as $capabilityData) {
            $this->createCapability($capabilityData, null, $processMap, $capabilityMap);
        }

        $this->entityManager->flush();

        // Second pass: set parent relationships
        foreach ($data['capabilities'] ?? [] as $capabilityData) {
            $this->setCapabilityParent($capabilityData, null, $capabilityMap);
        }

        $this->entityManager->flush();
    }

    private function createCapability(array $capabilityData, ?Capability $parent, array $processMap, array &$capabilityMap): Capability
    {
        $capability = new Capability();
        $slug = $this->slug($capabilityData['name']);
        $externalId = 'cap-' . $slug;
        error_log("Creating capability: {$capabilityData['name']} -> external_id: {$externalId}");
        $capability->setExternalId($externalId);
        $capability->setName($capabilityData['name']);
        $capability->setDescription($capabilityData['description'] ?? '');
        $capability->setType($capabilityData['type'] ?? 'main-capability');
        $capability->setParent($parent);

        // Add valuestreams
        foreach ($capabilityData['valuestreams'] ?? [] as $valuestreamId) {
            $valuestream = $this->entityManager->getRepository(Valuestream::class)->findOneBy(['externalId' => $valuestreamId]);
            if ($valuestream) {
                $capability->addValuestream($valuestream);
            }
        }

        // Add processes
        foreach ($capabilityData['processes'] ?? [] as $processName) {
            if (isset($processMap[$processName])) {
                $capability->addProcess($processMap[$processName]);
            }
        }

        $this->entityManager->persist($capability);
        
        // Add to map
        $capabilityMap[$capabilityData['name']] = $capability;

        // Create child capabilities
        foreach ($capabilityData['capabilities'] ?? [] as $childData) {
            $this->createCapability($childData, $capability, $processMap, $capabilityMap);
        }

        return $capability;
    }

    private function setCapabilityParent(array $capabilityData, ?Capability $parent, array $capabilityMap): void
    {
        $capability = $capabilityMap[$capabilityData['name']] ?? null;
        if (!$capability) return;

        $capability->setParent($parent);

        // Set parent for child capabilities
        foreach ($capabilityData['capabilities'] ?? [] as $childData) {
            $this->setCapabilityParent($childData, $capability, $capabilityMap);
        }
    }

    private function importArchitecture(): void
    {
        $data = $this->loadJsonData('architecture.json');

        if (isset($data['software-system'])) {
            $sys = $data['software-system'];
            
            $architecture = new Architecture();
            $architecture->setExternalId($sys['id']);
            $architecture->setName($sys['name']);
            $architecture->setDescription($sys['description']);

            $this->entityManager->persist($architecture);

            // Add components
            foreach ($sys['components'] ?? [] as $compData) {
                $component = new Architecture();
                $component->setExternalId($compData['id']);
                $component->setName($compData['name']);
                $component->setDescription($compData['description']);

                $this->entityManager->persist($component);
            }

            $this->entityManager->flush();
        }
    }

    private function importTeams(): void
    {
        $data = $this->loadJsonData('teams.json');
        
        // First, create a map of process names to process entities
        $processMap = [];
        $processes = $this->entityManager->getRepository(Process::class)->findAll();
        foreach ($processes as $process) {
            $processMap[$process->getName()] = $process;
        }

        // First, create a map of capability names to capability entities
        $capabilityMap = [];
        $capabilities = $this->entityManager->getRepository(Capability::class)->findAll();
        foreach ($capabilities as $capability) {
            $capabilityMap[$capability->getName()] = $capability;
        }

        foreach ($data['teams'] ?? [] as $i => $teamData) {
            $team = new Team();
            $team->setExternalId($teamData['id'] ?? 'team-' . $i);
            $team->setName($teamData['name']);
            $team->setDescription($teamData['description'] ?? '');

            // Add processes
            foreach ($teamData['processes'] ?? [] as $processName) {
                if (isset($processMap[$processName])) {
                    $team->addProcess($processMap[$processName]);
                }
            }

            // Add capabilities
            foreach ($teamData['processes'] ?? [] as $processName) {
                if (isset($capabilityMap[$processName])) {
                    $team->addCapability($capabilityMap[$processName]);
                }
            }

            $this->entityManager->persist($team);
        }

        $this->entityManager->flush();
    }

    private function importPipelines(): void
    {
        $data = $this->loadJsonData('pipelines.json');

        foreach ($data['pipelines'] ?? [] as $pipelineData) {
            $pipeline = new Pipeline();
            $pipeline->setId($pipelineData['id']);
            $pipeline->setName($pipelineData['name']);
            $pipeline->setDescription($pipelineData['description']);
            $pipeline->setRelations($pipelineData['relations'] ?? []);

            $this->entityManager->persist($pipeline);
        }

        $this->entityManager->flush();
    }

    private function importProcesses(): void
    {
        $data = $this->loadJsonData('processes.json');

        // First, create a map of product IDs to product entities
        $productMap = [];
        $products = $this->entityManager->getRepository(Product::class)->findAll();
        foreach ($products as $product) {
            $productMap[$product->getExternalId()] = $product;
        }

        foreach ($data['processes'] ?? [] as $processData) {
            $process = new Process();
            $process->setExternalId($processData['id']);
            $process->setName($processData['name']);
            $process->setDescription($processData['description']);

            // Add products based on valuestream relations
            foreach ($processData['relations'] ?? [] as $relation) {
                if ($relation['type'] === 'valuestream') {
                    // Find products that are connected to this valuestream
                    $productsForValuestream = $this->entityManager->getRepository(Product::class)
                        ->findByValuestream($relation['id']);
                    
                    foreach ($productsForValuestream as $product) {
                        if (isset($productMap[$product->getExternalId()])) {
                            $process->addProduct($productMap[$product->getExternalId()]);
                        }
                    }
                }
            }

            $this->entityManager->persist($process);
        }

        $this->entityManager->flush();
    }

    private function slug(string $s): string
    {
        $s = strtolower(trim($s));
        $s = preg_replace('/[^a-z0-9-]+/', '-', $s);
        return $s;
    }
}
