<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.js';
    import { goto } from '$app/navigation';
    import Header from '$lib/components/Header.svelte';
    import Card from '$lib/components/Card.svelte';
    import NotebookIcon from '$lib/components/icons/NotebookIcon.svelte';
    import ChartIcon from '$lib/components/icons/ChartIcon.svelte';
    import TargetIcon from '$lib/components/icons/TargetIcon.svelte';
    
    onMount(() => {
        auth.init();
    });
    
    const handleGetStarted = () => {
        goto('/auth');
    };
</script>

<svelte:head>
    <title>Workout Tracker</title>
</svelte:head>

<Header />

<main class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative bg-gray-900 overflow-hidden">
        <div class="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?fm=jpg&q=80&w=2000" 
                alt="Fitness workout background" 
                class="w-full h-full object-cover opacity-50"
            />
        </div>
        <div class="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Track Your Fitness
                    <span class="text-highlight">Journey</span>
                </h1>
                <p class="mt-6 max-w-lg mx-auto text-xl text-gray-300 sm:max-w-3xl">
                    Take control of your workouts with personalized tracking, progress analytics, and expert guidance. Start your transformation today.
                </p>
                <div class="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                    <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                        <button
                            on:click={handleGetStarted}
                            class="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-orange-600 md:py-4 md:text-lg md:px-10 transition-colors"
                        >
                            Get Started Free
                        </button>
                        <a
                            href="#features"
                            class="flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-gray-900 md:py-4 md:text-lg md:px-10 transition-colors"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
                    Why Choose Workout Tracker?
                </h2>
                <p class="mt-4 text-xl text-gray-600">
                    Everything you need to achieve your fitness goals in one place
                </p>
            </div>
            
            <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card 
                    title="Easy Tracking" 
                    description="Log your workouts quickly with our intuitive interface designed for busy lifestyles."
                    iconColor="bg-accent">
                    <NotebookIcon slot="icon" />
                </Card>
                
                <Card 
                    title="Progress Analytics" 
                    description="Visualize your progress with detailed charts and insights that keep you motivated."
                    iconColor="bg-secondary">
                    <ChartIcon slot="icon" />
                </Card>
                
                <Card 
                    title="Personalized Plans" 
                    description="Get customized workout plans tailored to your goals, experience, and preferences."
                    iconColor="bg-primary">
                    <TargetIcon slot="icon" />
                </Card>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-dark py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold text-white sm:text-4xl">
                Ready to Start Your Journey?
            </h2>
            <p class="mt-4 text-xl text-gray-300">
                Join thousands of users who are already achieving their fitness goals.
            </p>
            <button
                on:click={handleGetStarted}
                class="mt-8 px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-orange-600 md:py-4 md:text-lg md:px-10 transition-colors"
            >
                Get Started Today
            </button>
        </div>
    </section>
</main>
