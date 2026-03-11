<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use Stevenmaguire\OAuth2\Client\Provider\Keycloak;

final class KeycloakProviderFactory
{
    public function __construct(
        private readonly string $authServerUrl,
        private readonly string $realm,
        private readonly string $clientId,
        private readonly string $clientSecret,
        private readonly string $redirectUri,
    ) {
    }

    public function create(): Keycloak
    {
        return new Keycloak([
            'authServerUrl' => $this->authServerUrl,
            'realm' => $this->realm,
            'clientId' => $this->clientId,
            'clientSecret' => $this->clientSecret,
            'redirectUri' => $this->redirectUri,
        ]);
    }
}
