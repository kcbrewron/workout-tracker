<script>
    import { analytics } from '$lib/stores/analytics.js';
    import { preferences } from '$lib/stores/preferences.js';
    import { convertToDisplayUnits, formatLength, getInputStep, getInputPlaceholder } from '$lib/utils/units.js';
    import ConfirmModal from '$lib/components/ConfirmModal.svelte';
    import { onMount } from 'svelte';
    
    let measurements = {
        chest: '',
        waist: '',
        hips: '',
        neck: '',
        shoulders: '',
        leftBicep: '',
        rightBicep: '',
        leftForearm: '',
        rightForearm: '',
        leftThigh: '',
        rightThigh: '',
        leftCalf: '',
        rightCalf: ''
    };
    
    let date = new Date().toISOString().split('T')[0];
    let notes = '';
    let showAddForm = false;
    let editingEntry = null;
    let selectedMeasurements = new Set(['chest', 'waist', 'hips']);
    let showDeleteConfirm = false;
    let entryToDelete = null;
    
    $: measurementHistory = $analytics?.bodyMeasurements?.slice(0, 5) || [];
    $: measurementProgress = $analytics?.analytics?.measurementProgress || {};
    $: lengthUnit = $preferences?.lengthUnit || 'cm';
    $: unitSystem = $preferences?.unitSystem || 'metric';
    
    const measurementLabels = {
        chest: 'Chest',
        waist: 'Waist',
        hips: 'Hips',
        neck: 'Neck',
        shoulders: 'Shoulders',
        leftBicep: 'Left Bicep',
        rightBicep: 'Right Bicep',
        leftForearm: 'Left Forearm',
        rightForearm: 'Right Forearm',
        leftThigh: 'Left Thigh',
        rightThigh: 'Right Thigh',
        leftCalf: 'Left Calf',
        rightCalf: 'Right Calf'
    };
    
    const measurementCategories = {
        'Upper Body': ['chest', 'shoulders', 'neck'],
        'Arms': ['leftBicep', 'rightBicep', 'leftForearm', 'rightForearm'],
        'Core': ['waist', 'hips'],
        'Legs': ['leftThigh', 'rightThigh', 'leftCalf', 'rightCalf']
    };
    
    const handleAddMeasurement = () => {
        const selectedData = {};
        selectedMeasurements.forEach(key => {
            if (measurements[key] && measurements[key].trim()) {
                selectedData[key] = parseFloat(measurements[key]);
            }
        });
        
        if (Object.keys(selectedData).length > 0) {
            if (editingEntry) {
                analytics.updateBodyMeasurement(editingEntry.id, selectedData, date, notes, lengthUnit);
                editingEntry = null;
            } else {
                analytics.addBodyMeasurement(selectedData, date, notes, lengthUnit);
            }
            
            resetForm();
        }
    };
    
    const resetForm = () => {
        Object.keys(measurements).forEach(key => {
            measurements[key] = '';
        });
        date = new Date().toISOString().split('T')[0];
        notes = '';
        showAddForm = false;
    };
    
    const handleEdit = (entry) => {
        editingEntry = entry;
        selectedMeasurements.clear();
        
        Object.keys(measurementLabels).forEach(key => {
            if (entry[key] !== undefined && entry[key] !== null) {
                // Convert stored measurement (cm) to display units
                const displayMeasurement = convertToDisplayUnits(entry[key], 'length', unitSystem);
                measurements[key] = displayMeasurement.toString();
                selectedMeasurements.add(key);
            } else {
                measurements[key] = '';
            }
        });
        
        date = entry.date;
        notes = entry.notes || '';
        showAddForm = true;
        selectedMeasurements = selectedMeasurements;
    };
    
    const handleDelete = (id) => {
        entryToDelete = id;
        showDeleteConfirm = true;
    };
    
    const confirmDelete = () => {
        if (entryToDelete) {
            analytics.deleteBodyMeasurement(entryToDelete);
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
        resetForm();
    };
    
    const toggleMeasurement = (key) => {
        if (selectedMeasurements.has(key)) {
            selectedMeasurements.delete(key);
        } else {
            selectedMeasurements.add(key);
        }
        selectedMeasurements = selectedMeasurements;
    };
    
    const formatMeasurementDisplay = (value) => {
        const displayValue = convertToDisplayUnits(value, 'length', unitSystem);
        return formatLength(displayValue, lengthUnit);
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    
    const getProgressIcon = (change) => {
        if (change > 0.5) return '📈';
        if (change < -0.5) return '📉';
        return '➡️';
    };
    
    const getProgressColor = (change) => {
        if (change > 0.5) return 'text-red-600';
        if (change < -0.5) return 'text-green-600';
        return 'text-gray-600';
    };
    
    const hasValidMeasurements = () => {
        return Array.from(selectedMeasurements).some(key => 
            measurements[key] && measurements[key].trim()
        );
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
        <h2 class="text-2xl font-bold text-gray-900">Body Measurements</h2>
        <div class="flex items-center gap-3">
            <!-- Unit Toggle -->
            <div class="flex items-center">
                <label class="text-sm font-medium text-gray-700 mr-2">Units:</label>
                <button
                    on:click={() => preferences.toggleUnitSystem()}
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                    {lengthUnit} {unitSystem === 'metric' ? '→ in' : '→ cm'}
                </button>
            </div>
            
            <button 
                on:click={() => showAddForm = !showAddForm}
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                {showAddForm ? 'Cancel' : 'Add Measurements'}
            </button>
        </div>
    </div>
    
    <!-- Progress Overview -->
    {#if Object.keys(measurementProgress).length > 0}
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Recent Changes</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                {#each Object.entries(measurementProgress) as [key, change]}
                    <div class="bg-gray-50 rounded-lg p-3">
                        <h4 class="text-sm font-medium text-gray-700">{measurementLabels[key]}</h4>
                        <p class="text-lg font-bold {getProgressColor(change)}">
                            {getProgressIcon(change)} {change > 0 ? '+' : ''}{convertToDisplayUnits(change, 'length', unitSystem).toFixed(1)} {lengthUnit}
                        </p>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
    
    <!-- Add/Edit Form -->
    {#if showAddForm}
        <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4">
                {editingEntry ? 'Edit Measurements' : 'Add Body Measurements'}
            </h3>
            
            <div class="mb-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                        Select measurements to track:
                    </label>
                    
                    {#each Object.entries(measurementCategories) as [category, fields]}
                        <div class="mb-4">
                            <h4 class="text-sm font-semibold text-gray-600 mb-2">{category}</h4>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {#each fields as field}
                                    <label class="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedMeasurements.has(field)}
                                            on:change={() => toggleMeasurement(field)}
                                            class="mr-2"
                                        />
                                        <span class="text-sm">{measurementLabels[field]}</span>
                                    </label>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {#each Array.from(selectedMeasurements) as field}
                        <div>
                            <label for={field} class="block text-sm font-medium text-gray-700 mb-1">
                                {measurementLabels[field]} ({lengthUnit})
                            </label>
                            <input
                                id={field}
                                type="number"
                                step={getInputStep(lengthUnit)}
                                bind:value={measurements[field]}
                                placeholder={getInputPlaceholder(lengthUnit)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    {/each}
                </div>
                
                <div class="mb-4">
                    <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                    </label>
                    <textarea
                        id="notes"
                        bind:value={notes}
                        rows="2"
                        placeholder="e.g., Measured in the morning, after workout..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                </div>
                
                <div class="flex gap-2">
                    <button
                        on:click={handleAddMeasurement}
                        disabled={!hasValidMeasurements() || !date}
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {editingEntry ? 'Update' : 'Add'} Measurements
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
        </div>
    {/if}
    
    <!-- Measurement History -->
    <div>
        <h3 class="text-lg font-semibold mb-4">Measurement History</h3>
        
        {#if measurementHistory.length === 0}
            <div class="text-center py-8 text-gray-500">
                <p class="text-lg mb-2">📏</p>
                <p>No measurements recorded yet</p>
                <p class="text-sm">Start tracking your body measurements to monitor your progress!</p>
            </div>
        {:else}
            <div class="space-y-4">
                {#each measurementHistory as entry (entry.id)}
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="font-semibold text-gray-900">{formatDate(entry.date)}</h4>
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
                        
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {#each Object.entries(measurementLabels) as [key, label]}
                                {#if entry[key] !== undefined && entry[key] !== null}
                                    <div class="bg-gray-50 rounded p-2">
                                        <p class="text-xs text-gray-600">{label}</p>
                                        <p class="font-semibold">{formatMeasurementDisplay(entry[key])}</p>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
            
            {#if $analytics.bodyMeasurements.length > 5}
                <p class="text-center text-sm text-gray-500 mt-4">
                    Showing 5 most recent entries out of {$analytics.bodyMeasurements.length} total
                </p>
            {/if}
        {/if}
    </div>
</div>

<!-- Confirmation Modal -->
<ConfirmModal 
    bind:show={showDeleteConfirm}
    title="Delete Measurement Entry"
    message="Are you sure you want to delete this measurement entry? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    confirmType="danger"
    on:confirm={confirmDelete}
    on:cancel={cancelDelete}
/>