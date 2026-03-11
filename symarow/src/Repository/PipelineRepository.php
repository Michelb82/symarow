<?php

namespace App\Repository;

use App\Entity\Pipeline;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Pipeline>
 *
 * @method Pipeline|null find($id, $lockMode = null, $lockVersion = null)
 * @method Pipeline|null findOneBy(array $criteria, array $orderBy = null)
 * @method Pipeline[]    findAll()
 * @method Pipeline[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PipelineRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Pipeline::class);
    }

    public function save(Pipeline $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Pipeline $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}