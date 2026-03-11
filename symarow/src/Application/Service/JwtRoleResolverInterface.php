<?php

declare(strict_types=1);

namespace App\Application\Service;

use Symfony\Component\HttpFoundation\Request;

interface JwtRoleResolverInterface
{
    /**
     * Resolved role slug for templates (e.g. cto, architect, engineering_manager, engineer, business_employee).
     * Returns null if no valid JWT or role not found.
     */
    public function resolveRole(Request $request): ?string;

    /**
     * Raw role value from token (e.g. "Engineering Manager") or null.
     */
    public function resolveRawRole(Request $request): ?string;
}
