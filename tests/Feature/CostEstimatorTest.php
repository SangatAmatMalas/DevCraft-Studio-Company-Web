<?php

it('renders the interactive project cost calculator page', function () {
    $this->get('/kalkulator')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/calculator')
            ->has('projectTypes', 5)
            ->has('scaleOptions', 4)
            ->has('addons', 7)
            ->has('seo'));
});

it('permanently redirects /estimasi to /kalkulator', function () {
    $this->get('/estimasi')
        ->assertRedirect('/kalkulator');
});

it('lists /kalkulator in the sitemap.xml', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertOk();
    expect($response->getContent())->toContain(url('/kalkulator'));
});
