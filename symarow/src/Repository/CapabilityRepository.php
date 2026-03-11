<?php

namespace App\Repository;

use App\Entity\Capability;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Capability>
 *
 * @method Capability|null find($id, $lockMode = null, $lockVersion = null)
 * @method Capability|null findOneBy(array $criteria, array $orderBy = null)
 * @method Capability[]    findAll()
 * @method Capability[]    findBy(array $orderBy = null, $limit = null, $offset = null)
 */
class CapabilityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Capability::class);
    }

    public function save(Capability $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Capability $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find root capabilities (those with no parent)
     * @return Capability[]
     */
    public function findRootCapabilities(): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.parent IS NULL')
            ->getQuery()
            ->getResult();
    }
}