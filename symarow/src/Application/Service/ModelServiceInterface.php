<?php

namespace App\Application\Service;

use App\Application\DTO\ModelDTO;

interface ModelServiceInterface
{
    public function getModel(): ModelDTO;
    
    public function getProducts(): array;
    
    public function getCapabilities(): array;
    
    public function getTeams(): array;
    
    public function getArchitecture(): array;
    
    public function getPipelines(): array;
    
    public function getValuestreams(): array;
    
    public function getProcesses(): array;
}
