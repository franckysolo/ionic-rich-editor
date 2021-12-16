<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Dmv Rich <span class="error">Editor</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Dmv Rich <span class="error">Editor</span></ion-title>
        </ion-toolbar>
      </ion-header>
      <div id="container" class="h-full flex justify-items-center items-end p-2">
        <div class="w-full">
          <v-chat-writter />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
import { defineComponent } from 'vue'
import VChatWritter from '@/components/VChatWritter'

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    VChatWritter
  }
})
</script>

<style scoped>

</style>
