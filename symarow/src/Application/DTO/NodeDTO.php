<?php

namespace App\Application\DTO;

class NodeDTO
{
    public function __construct(
        public string $id,
        public string $name,
        public string $description,
        public string $type,
        public ?string $parentId = null,
        public array $relations = []
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['id'],
            $data['name'],
            $data['description'],
            $data['type'],
            $data['parentId'] ?? null,
            $data['relations'] ?? []
        );
    }

    public function toArray(): array
    {
        $result = [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
        ];

        if ($this->parentId !== null) {
            $result['parentId'] = $this->parentId;
        }

        if (!empty($this->relations)) {
            $result['relations'] = $this->relations;
        }

        return $result;
    }
}
