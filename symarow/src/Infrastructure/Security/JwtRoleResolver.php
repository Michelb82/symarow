<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Application\Service\JwtRoleResolverInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\HttpFoundation\Request;

final class JwtRoleResolver implements JwtRoleResolverInterface
{
    private const ROLE_CLAIM = 'role';
    private const KEYCLOAK_ROLES_CLAIM = 'realm_access';
    private const ALLOWED_ROLES = [
        'CTO',
        'Architect',
        'Engineering Manager',
        'Engineer',
        'Business-Employee',
    ];

    /** Map raw role to template slug */
    private const ROLE_TO_SLUG = [
        'CTO' => 'cto',
        'Architect' => 'architect',
        'Engineering Manager' => 'engineering_manager',
        'Engineer' => 'engineer',
        'Business-Employee' => 'business_employee',
        'business-employee' => 'business_employee',
        'engineering_manager' => 'engineering_manager',
    ];

    public function __construct(
        private readonly ?string $jwtSecret,
        private readonly ?string $jwtPublicKey,
        private readonly string $cookieName = 'app_token',
    ) {
    }

    public function resolveRole(Request $request): ?string
    {
        $raw = $this->resolveRawRole($request);
        if ($raw === null) {
            return null;
        }

        $normalized = $this->normalizeRawRole($raw);
        return self::ROLE_TO_SLUG[$normalized] ?? self::ROLE_TO_SLUG[$raw] ?? null;
    }

    public function resolveRawRole(Request $request): ?string
    {
        $token = $this->extractToken($request);
        if ($token === null || $token === '') {
            return null;
        }

        try {
            $payload = $this->decode($token);
        } catch (\Throwable) {
            return null;
        }

        $role = $payload[self::ROLE_CLAIM] ?? null;
        if (is_string($role)) {
            return $this->normalizeRawRole($role);
        }

        // Keycloak: realm_access.roles array
        $realmAccess = $payload[self::KEYCLOAK_ROLES_CLAIM] ?? null;
        if (is_array($realmAccess)) {
            $roles = $realmAccess['roles'] ?? [];
            if (is_array($roles)) {
                foreach ($roles as $r) {
                    if (is_string($r)) {
                        $normalized = $this->normalizeRawRole($r);
                        if (isset(self::ROLE_TO_SLUG[$normalized]) || in_array($normalized, self::ALLOWED_ROLES, true)) {
                            return $normalized;
                        }
                    }
                }
            }
        }

        return null;
    }

    private function extractToken(Request $request): ?string
    {
        $auth = $request->headers->get('Authorization');
        if (is_string($auth) && str_starts_with(strtolower($auth), 'bearer ')) {
            return trim(substr($auth, 7));
        }

        return $request->cookies->get($this->cookieName);
    }

    /**
     * @return array<string, mixed>
     */
    private function decode(string $token): array
    {
        if ($this->jwtPublicKey !== null && $this->jwtPublicKey !== '') {
            $key = new Key($this->jwtPublicKey, 'RS256');
            $decoded = JWT::decode($token, $key);
            return (array) $decoded;
        }

        if ($this->jwtSecret !== null && $this->jwtSecret !== '') {
            $key = new Key($this->jwtSecret, 'HS256');
            $decoded = JWT::decode($token, $key);
            return (array) $decoded;
        }

        // Dev only: decode without verification (do not use in production)
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new \InvalidArgumentException('Invalid JWT');
        }
        $payload = JWT::urlsafeB64Decode($parts[1]);
        $json = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
        return is_array($json) ? $json : [];
    }

    private function normalizeRawRole(string $raw): string
    {
        $trimmed = trim($raw);
        foreach (self::ALLOWED_ROLES as $allowed) {
            if (strcasecmp($trimmed, $allowed) === 0) {
                return $allowed;
            }
        }
        return $trimmed;
    }
}
