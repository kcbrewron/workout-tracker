<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.js';
    import { analytics } from '$lib/stores/analytics.js';
    import { preferences } from '$lib/stores/preferences.js';
    import { goto } from '$app/navigation';
    import WeightTracker from '$lib/components/analytics/WeightTracker.svelte';
    import BodyMeasurements from '$lib/components/analytics/BodyMeasurements.svelte';
    
    let activeTab = 'overview';
    
    $: isAuthenticated = $auth.isAuthenticated;
    $: currentWeight = $analytics?.analytics?.currentWeight;
    $: weightChange = $analytics?.analytics?.weightChange30Days;
    $: weightTrend = $analytics?.analytics?.weightTrend || 'stable';
    $: totalMeasurements = $analytics?.bodyMeasurements?.length || 0;
    $: totalWeightEntries = $analytics?.weightHistory?.length || 0;
    $: lastMeasurementDate = $analytics?.analytics?.lastMeasurementDate;
    
    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'weight', label: 'Weight', icon: '⚖️' },
        { id: 'measurements', label: 'Measurements', icon: '📏' }
    ];
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'gaining': return '📈';
            case 'losing': return '📉';
            default: return '➡️';
        }
    };
    
    const getTrendColor = (trend) => {
        switch (trend) {
            case 'gaining': return 'text-green-600';
            case 'losing': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };
    
    onMount(() => {
        if (!isAuthenticated) {
            goto('/auth/login');
            return;
        }
        
        if (typeof window !== 'undefined') {
            analytics.init();
            preferences.init();
        }
    });
    
    $: if (!isAuthenticated) {
        goto('/auth/login');
    }
</script>

<svelte:head>
    <title>Progress Analytics - Workout Tracker</title>
    <meta name="description" content="Track your fitness progress with detailed analytics, weight tracking, and body measurements." />
</svelte:head>

{#if isAuthenticated}
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Progress Analytics</h1>
                        <p class="text-gray-600 mt-1">Track your fitness journey with detailed insights</p>
                    </div>
                    
                    <button
                        on:click={() => goto('/dashboard')}
                        class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
                
                <!-- Tab Navigation -->
                <div class="mt-6">
                    <nav class="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        {#each tabs as tab}
                            <button
                                on:click={() => activeTab = tab.id}
                                class="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors {
                                    activeTab === tab.id 
                                        ? 'bg-white text-gray-900 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }"
                            >
                                <span class="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        {/each}
                    </nav>
                </div>
            </div>
        </div>
        
        <!-- Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {#if activeTab === 'overview'}
                <!-- Overview Tab -->
                <div class="space-y-6">
                    <!-- Quick Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span class="text-blue-600 text-lg">⚖️</span>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Current Weight</p>
                                    <p class="text-2xl font-semibold text-gray-900">
                                        {currentWeight ? `${currentWeight.toFixed(1)} kg` : 'No data'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span class="text-green-600 text-lg">{getTrendIcon(weightTrend)}</span>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">30-Day Trend</p>
                                    <p class="text-2xl font-semibold {getTrendColor(weightTrend)}">
                                        {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg` : 'No data'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span class="text-purple-600 text-lg">📏</span>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Measurements</p>
                                    <p class="text-2xl font-semibold text-gray-900">{totalMeasurements}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span class="text-orange-600 text-lg">📊</span>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Weight Entries</p>
                                    <p class="text-2xl font-semibold text-gray-900">{totalWeightEntries}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Progress Summary -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-4">Progress Summary</h2>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 class="font-medium text-gray-900">Weight Tracking</h3>
                                    <p class="text-sm text-gray-600">
                                        {totalWeightEntries > 0 
                                            ? `${totalWeightEntries} entries recorded` 
                                            : 'No weight entries yet'
                                        }
                                    </p>
                                </div>
                                <button
                                    on:click={() => activeTab = 'weight'}
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                            
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 class="font-medium text-gray-900">Body Measurements</h3>
                                    <p class="text-sm text-gray-600">
                                        {totalMeasurements > 0 
                                            ? `${totalMeasurements} measurement sessions recorded` 
                                            : 'No measurements recorded yet'
                                        }
                                    </p>
                                </div>
                                <button
                                    on:click={() => activeTab = 'measurements'}
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Getting Started -->
                    {#if totalWeightEntries === 0 && totalMeasurements === 0}
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h2 class="text-lg font-semibold text-blue-900 mb-2">Get Started with Progress Tracking</h2>
                            <p class="text-blue-700 mb-4">
                                Start tracking your progress to see detailed insights about your fitness journey.
                            </p>
                            <div class="flex flex-col sm:flex-row gap-3">
                                <button
                                    on:click={() => activeTab = 'weight'}
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    ⚖️ Add Weight Entry
                                </button>
                                <button
                                    on:click={() => activeTab = 'measurements'}
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    📏 Record Measurements
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            
            {:else if activeTab === 'weight'}
                <!-- Weight Tab -->
                <WeightTracker />
            
            {:else if activeTab === 'measurements'}
                <!-- Measurements Tab -->
                <BodyMeasurements />
            {/if}
        </div>
    </div>
{:else}
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
            <p class="text-gray-600">Please log in to access your analytics.</p>
        </div>
    </div>
{/if}