<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegionSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_cities_endpoint_supports_search_query(): void
    {
        $response = $this->getJson('/api/public/cities?search=Sema');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $cities = $response->json('data');
        $this->assertContains('Kota Semarang', $cities);
        $this->assertContains('Kabupaten Semarang', $cities);
        $this->assertNotContains('Kota Bandung', $cities);
    }

    public function test_districts_by_city_endpoint_supports_search_query(): void
    {
        $response = $this->getJson('/api/public/cities/' . urlencode('Kota Semarang') . '/districts?search=Banyu');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $districts = $response->json('data');
        $this->assertContains('Banyumanik', $districts);
        $this->assertNotContains('Tembalang', $districts);
    }

    public function test_all_districts_global_search_returns_district_and_city(): void
    {
        $response = $this->getJson('/api/public/districts?search=Ungaran');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json('data');
        $this->assertNotEmpty($data);

        $districtNames = array_column($data, 'district');
        $this->assertContains('Ungaran Barat', $districtNames);
        $this->assertContains('Ungaran Timur', $districtNames);
    }

    public function test_all_districts_requires_min_two_characters(): void
    {
        $response = $this->getJson('/api/public/districts?search=a');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [],
            ]);
    }
}
