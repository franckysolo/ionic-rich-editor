<template>
  <div class="border" v-show="show">
    <ion-text>
      <p class="text-center ion-margin-top"><var>{{ hex }}</var></p>
    </ion-text>
    <div ref="color" class="w-24 h-24 mx-auto my-5" />
    <ion-range color="danger" min="0" max="255" pin="true" step="1" v-model="red" @ionChange="updateColor">
      <ion-icon size="small" color="danger" slot="start" :icon="colorPalette" />
    </ion-range>
    <ion-range color="success" min="0" max="255" step="1" pin="true" v-model="green" @ionChange="updateColor">
      <ion-icon size="small" color="success" slot="start" :icon="colorPalette" />
    </ion-range>
    <ion-range color="primary" min="0" max="255" step="1" pin="true" v-model="blue" @ionChange="updateColor">
      <ion-icon size="small" color="primary" slot="start" :icon="colorPalette" />
    </ion-range>
    <!-- add alpha if we need 0 to 127 -->
    <ion-button color="light" class="ion-margin" expand="block" @click="selectColor">Ok</ion-button>
  </div>
</template>

<script>
import { 
  defineComponent, 
  reactive, 
  ref, 
  toRefs, 
  onMounted 
} from 'vue'
import { 
  IonButton,
  IonText,
  IonRange,
  IonIcon
} from '@ionic/vue'
import { colorPalette } from 'ionicons/icons'

export default defineComponent({
  name: 'VColorPicker',
  components: {
    IonButton,
    IonText,
    IonRange,
    IonIcon
  },
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  setup (_, { emit }) {
    const color = ref(null)

    const palette = reactive({
      red: 122,
      green: 122,
      blue: 122,
      alpha: 0, // could use rgba if we want :)
      hex: '#7a7a7a'
    })

    const updateColor = () => {
      color.value.style.backgroundColor = `rgb(${palette.red},${palette.green},${palette.blue})`
      palette.hex = rgbToHex(palette.red, palette.green, palette.blue)
    }

    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')

    const selectColor = () => {
      emit('select-value', palette)
      emit('close')
    }

    onMounted(updateColor)

    return {
      colorPalette,
      selectColor,
      updateColor,
      color,
      ...toRefs(palette)
    }
  }
})
</script>
