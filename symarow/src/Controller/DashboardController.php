<?php

namespace App\Controller;

use App\Application\Service\JwtRoleResolverInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DashboardController extends AbstractController
{
    public function __construct(
        private readonly JwtRoleResolverInterface $jwtRoleResolver
    ) {
    }

    #[Route('/', name: 'dashboard', methods: ['GET'])]
    public function dashboard(Request $request): Response
    {
        $roleSlug = $this->jwtRoleResolver->resolveRole($request);
        $rawRole = $this->jwtRoleResolver->resolveRawRole($request);

        return $this->render('dashboard.html.twig', [
            'role' => $roleSlug,
            'raw_role' => $rawRole,
            'has_role' => $roleSlug !== null,
        ]);
    }
}
