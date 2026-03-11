<?php

namespace App\Controller;

use App\Infrastructure\Security\KeycloakProviderFactory;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
    public function __construct(
        private readonly KeycloakProviderFactory $keycloakFactory,
        private readonly string $appTokenCookieName,
    ) {
    }

    #[Route('/login', name: 'auth_login', methods: ['GET'])]
    public function login(Request $request): RedirectResponse
    {
        $session = $request->getSession();
        $provider = $this->keycloakFactory->create();

        $authUrl = $provider->getAuthorizationUrl();
        $session->set('oauth2state', $provider->getState());

        return new RedirectResponse($authUrl);
    }

    #[Route('/auth/callback', name: 'auth_callback', methods: ['GET'])]
    public function callback(Request $request): RedirectResponse|Response
    {
        $session = $request->getSession();
        $state = $session->get('oauth2state');

        if (empty($request->query->get('state')) || $request->query->get('state') !== $state) {
            $session->remove('oauth2state');
            return new Response('Invalid state. Please try logging in again.', Response::HTTP_BAD_REQUEST);
        }

        $session->remove('oauth2state');

        $code = $request->query->get('code');
        if (!is_string($code) || $code === '') {
            return new Response('Missing authorization code.', Response::HTTP_BAD_REQUEST);
        }

        $provider = $this->keycloakFactory->create();

        try {
            $accessToken = $provider->getAccessToken('authorization_code', [
                'code' => $code,
            ]);
        } catch (IdentityProviderException $e) {
            return new Response(
                'Keycloak error: ' . $e->getMessage(),
                Response::HTTP_FORBIDDEN
            );
        }

        $tokenString = $accessToken->getToken();
        $response = new RedirectResponse($this->generateUrl('dashboard'));

        $response->headers->setCookie(
            \Symfony\Component\HttpFoundation\Cookie::create($this->appTokenCookieName)
                ->withValue($tokenString)
                ->withPath('/')
                ->withSecure($request->isSecure())
                ->withHttpOnly(true)
                ->withSameSite(\Symfony\Component\HttpFoundation\Cookie::SAMESITE_LAX)
                ->withExpires(new \DateTimeImmutable('+1 day'))
        );

        return $response;
    }

    #[Route('/logout', name: 'auth_logout', methods: ['GET'])]
    public function logout(Request $request): RedirectResponse
    {
        $response = new RedirectResponse($this->generateUrl('home'));
        $response->headers->clearCookie($this->appTokenCookieName, '/');

        return $response;
    }
}
