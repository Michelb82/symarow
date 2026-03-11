<?php

namespace App\Controller;

use App\Application\Service\ModelServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DataController extends AbstractController
{
    public function __construct(
        private ModelServiceInterface $modelService
    ) {
    }

    #[Route('/model', name: 'get_model', methods: ['GET'])]
    public function getModel(): JsonResponse
    {
        $model = $this->modelService->getModel();
        return new JsonResponse($model->toArray());
    }

    #[Route('/products', name: 'get_products', methods: ['GET'])]
    public function getProducts(): JsonResponse
    {
        $data = $this->modelService->getProducts();
        return new JsonResponse($data);
    }

    #[Route('/capabilities', name: 'get_capabilities', methods: ['GET'])]
    public function getCapabilities(): JsonResponse
    {
        $data = $this->modelService->getCapabilities();
        return new JsonResponse($data);
    }

    #[Route('/teams', name: 'get_teams', methods: ['GET'])]
    public function getTeams(): JsonResponse
    {
        $data = $this->modelService->getTeams();
        return new JsonResponse($data);
    }

    #[Route('/architecture', name: 'get_architecture', methods: ['GET'])]
    public function getArchitecture(): JsonResponse
    {
        $data = $this->modelService->getArchitecture();
        return new JsonResponse($data);
    }

    #[Route('/pipelines', name: 'get_pipelines', methods: ['GET'])]
    public function getPipelines(): JsonResponse
    {
        $data = $this->modelService->getPipelines();
        return new JsonResponse($data);
    }

    #[Route('/valuestreams', name: 'get_valuestreams', methods: ['GET'])]
    public function getValuestreams(): JsonResponse
    {
        $data = $this->modelService->getValuestreams();
        return new JsonResponse($data);
    }

    #[Route('/processes', name: 'get_processes', methods: ['GET'])]
    public function getProcesses(): JsonResponse
    {
        $data = $this->modelService->getProcesses();
        return new JsonResponse($data);
    }
}
