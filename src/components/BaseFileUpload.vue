<script setup>
import { ref, watch } from 'vue'
import { UploadCloud, FileText, Image as ImageIcon, X, Check } from '@lucide/vue'

const props = defineProps({
  modelValue: {
    type: [String, File],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: 'image/*,.pdf'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isDragging = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')

// Initialize preview if modelValue is string URL
watch(
  () => props.modelValue,
  (val) => {
    if (typeof val === 'string' && val.trim() !== '') {
      previewUrl.value = val
    }
  },
  { immediate: true }
)

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file) => {
  selectedFile.value = file

  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target.result
      emit('update:modelValue', e.target.result)
      emit('change', { file, previewUrl: e.target.result })
    }
    reader.readAsDataURL(file)
  } else {
    previewUrl.value = ''
    emit('update:modelValue', file.name)
    emit('change', { file, previewUrl: '' })
  }
}

const clearFile = () => {
  selectedFile.value = null
  previewUrl.value = ''
  emit('update:modelValue', '')
  emit('change', null)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 text-left font-inter">
    <label v-if="label" class="text-sm font-medium text-neutral-primary flex items-center justify-between">
      <span>{{ label }} <span v-if="required" class="text-red-500">*</span></span>
      <span v-if="selectedFile" class="text-xs text-primary-base font-semibold flex items-center gap-1">
        <Check class="w-3.5 h-3.5" /> Terpilih
      </span>
    </label>

    <!-- File Dropzone Box -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'relative border-2 border-dashed rounded-xl p-4 sm:p-5 transition-all text-center cursor-pointer select-none flex flex-col items-center justify-center min-h-30',
        isDragging ? 'border-primary-base bg-[#D7EAE3]/40' : 'border-primary-base/40 bg-[#D7EAE3]/20 hover:bg-[#D7EAE3]/30',
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      ]"
    >
      <input
        type="file"
        :accept="accept"
        :disabled="disabled"
        @change="handleFileSelect"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />

      <!-- PREVIEW IMAGE STATE -->
      <div v-if="previewUrl && previewUrl.startsWith('data:image')" class="relative w-full flex items-center justify-center gap-4">
        <img :src="previewUrl" alt="File Preview" class="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-xs" />
        <div class="text-left flex-1 min-w-0">
          <p class="text-xs font-semibold text-neutral-primary truncate">{{ selectedFile?.name || 'Gambar Terunggah' }}</p>
          <p class="text-[11px] text-[#52605D] mt-0.5" v-if="selectedFile">
            {{ (selectedFile.size / 1024).toFixed(1) }} KB
          </p>
          <button
            type="button"
            @click.stop="clearFile"
            class="mt-2 text-xs text-red-600 font-semibold hover:underline flex items-center gap-1 relative z-20 cursor-pointer"
          >
            <X class="w-3.5 h-3.5" /> Hapus Gambar
          </button>
        </div>
      </div>

      <!-- PREVIEW FILE STATE (Non Image) -->
      <div v-else-if="selectedFile" class="flex items-center gap-3 w-full justify-between px-2">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-10 h-10 rounded-lg bg-primary-base text-white flex items-center justify-center shrink-0">
            <FileText class="w-5 h-5" />
          </div>
          <div class="text-left min-w-0">
            <p class="text-xs font-semibold text-neutral-primary truncate">{{ selectedFile.name }}</p>
            <p class="text-[11px] text-[#52605D]">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
          </div>
        </div>
        <button
          type="button"
          @click.stop="clearFile"
          class="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 relative z-20 cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- INITIAL UPLOAD PROMPT STATE -->
      <div v-else class="flex flex-col items-center gap-1.5 py-1">
        <div class="w-10 h-10 rounded-full bg-primary-base/10 text-primary-base flex items-center justify-center">
          <UploadCloud class="w-5 h-5" />
        </div>
        <div>
          <p class="text-xs font-semibold text-neutral-primary">
            Klik atau seret file ke sini untuk mengunggah
          </p>
          <p class="text-[11px] text-[#52605D] mt-0.5">
            Format yang didukung: JPG, PNG, WEBP, atau PDF (Maks. 5MB)
          </p>
        </div>
      </div>

    </div>
  </div>
</template>
