<?php

namespace App\Repository;

use App\Entity\Valuestream;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Valuestream>
 *
 * @method Valuestream|null find($id, $lockMode = null, $lockVersion = null)
 * @method Valuestream|null findOneBy(array $criteria, array $orderBy = null)
 * @method Valuestream[]    findAll()
 * @method Valuestream[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ValuestreamRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Valuestream::class);
    }

    public function save(Valuestream $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Valuestream $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}