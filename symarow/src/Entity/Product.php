<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ProductRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ApiResource]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $description = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $externalId = null;

    #[ORM\ManyToMany(targetEntity: Valuestream::class)]
    private Collection $valuestreams;

    public function __construct()
    {
        $this->valuestreams = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getExternalId(): ?string
    {
        return $this->externalId;
    }

    public function setExternalId(string $externalId): static
    {
        $this->externalId = $externalId;

        return $this;
    }

    /**
     * @return Collection<int, Valuestream>
     */
    public function getValuestreams(): Collection
    {
        return $this->valuestreams;
    }

    public function addValuestream(Valuestream $valuestream): static
    {
        if (!$this->valuestreams->contains($valuestream)) {
            $this->valuestreams->add($valuestream);
        }

        return $this;
    }

    public function removeValuestream(Valuestream $valuestream): static
    {
        $this->valuestreams->removeElement($valuestream);

        return $this;
    }
}