<?php

namespace App\Application\DTO;

class ModelDTO
{
    /**
     * @var NodeDTO[]
     */
    public array $nodes;

    public function __construct(array $nodes)
    {
        $this->nodes = $nodes;
    }

    public static function fromArray(array $data): self
    {
        $nodes = [];
        foreach ($data['nodes'] ?? [] as $nodeData) {
            $nodes[] = NodeDTO::fromArray($nodeData);
        }

        return new self($nodes);
    }

    public function toArray(): array
    {
        return [
            'nodes' => array_map(fn(NodeDTO $node) => $node->toArray(), $this->nodes)
        ];
    }
}
