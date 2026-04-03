<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-50 border-t border-gray-200 mt-16">
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="text-sm text-gray-600">
        © {currentYear} Сравнение тарифов Шелково
      </div>
      
      <nav class="flex gap-6">
        <a 
          href="#methodology" 
          class="text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          Методология
        </a>
        <a 
          href="#disclaimer" 
          class="text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          Отказ от ответственности
        </a>
      </nav>
    </div>
  </div>
</footer>
