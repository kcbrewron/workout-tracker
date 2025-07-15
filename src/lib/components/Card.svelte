<script>
    export let title = '';
    export let description = '';
    export let iconColor = 'bg-primary';
    export let hoverEffect = true;
</script>

<div class="bg-white rounded-lg shadow-md p-6 transition-all duration-200" 
     class:hover:shadow-lg={hoverEffect}
     class:hover:scale-105={hoverEffect}>
    <div class="text-center">
        <div class="w-16 h-16 {iconColor} rounded-full flex items-center justify-center mx-auto mb-4">
            <slot name="icon" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p class="text-gray-600">{description}</p>
        
        <!-- Optional content slot -->
        <slot />
    </div>
</div>