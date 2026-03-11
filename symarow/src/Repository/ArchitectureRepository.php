<?php

namespace App\Repository;

use App\Entity\Architecture;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Architecture>
 *
 * @method Architecture|null find($id, $lockMode = null, $lockVersion = null)
 * @method Architecture|null findOneBy(array $criteria, array $orderBy = null)
 * @method Architecture[]    findAll()
 * @method Architecture[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ArchitectureRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Architecture::class);
    }

    public function save(Architecture $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Architecture $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}