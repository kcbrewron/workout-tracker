<script>
    import { analytics } from '$lib/stores/analytics.js';
    import { preferences } from '$lib/stores/preferences.js';
    import { convertToDisplayUnits, formatWeight, getInputStep, getInputPlaceholder } from '$lib/utils/units.js';
    import ConfirmModal from '$lib/components/ConfirmModal.svelte';
    import { onMount } from 'svelte';
    
    let weight = '';
    let date = new Date().toISOString().split('T')[0];
    let notes = '';
    let showAddForm = false;
    let editingEntry = null;
    let showDeleteConfirm = false;
    let entryToDelete = null;
    
    $: weightHistory = $analytics?.weightHistory?.slice(0, 10) || [];
    $: currentWeight = $analytics?.analytics?.currentWeight;
    $: weightChange = $analytics?.analytics?.weightChange30Days;
    $: weightTrend = $analytics?.analytics?.weightTrend || 'stable';
    $: weightUnit = $preferences?.weightUnit || 'kg';
    $: unitSystem = $preferences?.unitSystem || 'metric';
    
    const handleAddWeight = () => {
        if (weight && date) {
            if (editingEntry) {
                analytics.updateWeightEntry(editingEntry.id, weight, date, notes, weightUnit);
                editingEntry = null;
            } else {
                analytics.addWeightEntry(weight, date, notes, weightUnit);
            }
            
            weight = '';
            date = new Date().toISOString().split('T')[0];
            notes = '';
            showAddForm = false;
        }
    };
    
    const handleEdit = (entry) => {
        editingEntry = entry;
        // Convert stored weight (kg) to display units
        const displayWeight = convertToDisplayUnits(entry.weight, 'weight', unitSystem);
        weight = displayWeight.toString();
        date = entry.date;
        notes = entry.notes || '';
        showAddForm = true;
    };
    
    const handleDelete = (id) => {
        entryToDelete = id;
        showDeleteConfirm = true;
    };
    
    const confirmDelete = () => {
        if (entryToDelete) {
            analytics.deleteWeightEntry(entryToDelete);
            entryToDelete = null;
        }
        showDeleteConfirm = false;
    };
    
    const cancelDelete = () => {
        entryToDelete = null;
        showDeleteConfirm = false;
    };
    
    const cancelEdit = () => {
        editingEntry = null;
        weight = '';
        date = new Date().toISOString().split('T')[0];
        notes = '';
        showAddForm = false;
    };
    
    const formatWeightDisplay = (weight) => {
        const displayWeight = convertToDisplayUnits(weight, 'weight', unitSystem);
        return formatWeight(displayWeight, weightUnit);
    };
    
    const formatDate = (dateString) => {
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
        if (typeof window !== 'undefined') {
            analytics.init();
            preferences.init();
        }
    });
</script>

<div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Weight Tracking</h2>
        <div class="flex items-center gap-3">
            <!-- Unit Toggle -->
            <div class="flex items-center">
                <label class="text-sm font-medium text-gray-700 mr-2">Units:</label>
                <button
                    on:click={() => preferences.toggleUnitSystem()}
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                    {weightUnit} {unitSystem === 'metric' ? '→ lbs' : '→ kg'}
                </button>
            </div>
            
            <button 
                on:click={() => showAddForm = !showAddForm}
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                {showAddForm ? 'Cancel' : 'Add Weight'}
            </button>
        </div>
    </div>
    
    <!-- Current Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Current Weight</h3>
            <p class="text-2xl font-bold text-gray-900">
                {currentWeight ? formatWeightDisplay(currentWeight) : 'No data'}
            </p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-1">30-Day Change</h3>
            <p class="text-2xl font-bold {getTrendColor(weightTrend)}">
                {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${convertToDisplayUnits(weightChange, 'weight', unitSystem).toFixed(1)} ${weightUnit}` : 'No data'}
            </p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Trend</h3>
            <p class="text-2xl font-bold {getTrendColor(weightTrend)}">
                {getTrendIcon(weightTrend)} {weightTrend.charAt(0).toUpperCase() + weightTrend.slice(1)}
            </p>
        </div>
    </div>
    
    <!-- Add/Edit Form -->
    {#if showAddForm}
        <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4">
                {editingEntry ? 'Edit Weight Entry' : 'Add Weight Entry'}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="weight" class="block text-sm font-medium text-gray-700 mb-1">
                        Weight ({weightUnit})
                    </label>
                    <input
                        id="weight"
                        type="number"
                        step={getInputStep(weightUnit)}
                        bind:value={weight}
                        placeholder={getInputPlaceholder(weightUnit)}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <div>
                    <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
                        Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        bind:value={date}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>
            
            <div class="mb-4">
                <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                </label>
                <textarea
                    id="notes"
                    bind:value={notes}
                    rows="2"
                    placeholder="e.g., After breakfast, morning weigh-in..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
            </div>
            
            <div class="flex gap-2">
                <button
                    on:click={handleAddWeight}
                    disabled={!weight || !date}
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {editingEntry ? 'Update' : 'Add'} Weight
                </button>
                
                {#if editingEntry}
                    <button
                        on:click={cancelEdit}
                        class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                {/if}
            </div>
        </div>
    {/if}
    
    <!-- Weight History -->
    <div>
        <h3 class="text-lg font-semibold mb-4">Recent Entries</h3>
        
        {#if weightHistory.length === 0}
            <div class="text-center py-8 text-gray-500">
                <p class="text-lg mb-2">📊</p>
                <p>No weight entries yet</p>
                <p class="text-sm">Start tracking your weight to see your progress!</p>
            </div>
        {:else}
            <div class="space-y-3">
                {#each weightHistory as entry (entry.id)}
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex-1">
                            <div class="flex items-center gap-4">
                                <span class="text-xl font-semibold text-gray-900">
                                    {formatWeightDisplay(entry.weight)}
                                </span>
                                <span class="text-sm text-gray-500">
                                    {formatDate(entry.date)}
                                </span>
                            </div>
                            {#if entry.notes}
                                <p class="text-sm text-gray-600 mt-1">{entry.notes}</p>
                            {/if}
                        </div>
                        
                        <div class="flex gap-2">
                            <button
                                on:click={() => handleEdit(entry)}
                                class="text-blue-600 hover:text-blue-700 px-2 py-1 text-sm"
                            >
                                Edit
                            </button>
                            <button
                                on:click={() => handleDelete(entry.id)}
                                class="text-red-600 hover:text-red-700 px-2 py-1 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
            
            {#if $analytics.weightHistory.length > 10}
                <p class="text-center text-sm text-gray-500 mt-4">
                    Showing 10 most recent entries out of {$analytics.weightHistory.length} total
                </p>
            {/if}
        {/if}
    </div>
</div>

<!-- Confirmation Modal -->
<ConfirmModal 
    bind:show={showDeleteConfirm}
    title="Delete Weight Entry"
    message="Are you sure you want to delete this weight entry? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    confirmType="danger"
    on:confirm={confirmDelete}
    on:cancel={cancelDelete}
/>