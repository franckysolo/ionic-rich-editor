<template>

<div class="static">
  <pre class="p-4 whitespace-pre-line bg-white border-t" v-show="debug" v-text="currentStyle" />
  <pre class="p-4 whitespace-pre-line bg-white border-t" v-show="debug" v-text="content" />
  <div class="relative">
    <component class="bg-white absolute left-56 bottom-0 w-1/3" 
      v-show="isOpenRef" 
      @select-value="applyCommand"
      @close="isOpenRef = false"
      :is="currentComponent">
    </component>
  </div>
  <div class="border rounded-lg shadow-md">
    <div id="v-chat-writter-toolbar" class="bg-gray-100">
      <ion-toolbar color="transparent" class="ion-no-padding ion-no-margin" v-show="enableToolbar">
        <ion-buttons slot="start" class="ion-no-padding ion-no-margin">   
          <ion-button :color="currentStyle == 'bold' ? 'orange': 'dark'" @click.stop="execCommand('bold')">
            <ion-label><ion-text>B</ion-text></ion-label>
          </ion-button>
          <ion-button :color="currentStyle == 'italic' ? 'orange': 'dark'" @click="execCommand('italic')">
            <ion-label><ion-text class="italic">I</ion-text></ion-label>
          </ion-button>
          <ion-button :color="currentStyle == 'underline' ? 'orange': 'dark'" @click="execCommand('underline')">
            <ion-label><ion-text class="underline">U</ion-text></ion-label>
          </ion-button>
          <ion-button :color="currentStyle == 'strikeThrough' ? 'orange': 'dark'" @click="execCommand('strikeThrough')">
            <ion-label><ion-text class="line-through">S</ion-text></ion-label>
          </ion-button>
          <ion-button :color="currentStyle == 'insertorderedlist' ? 'orange': 'dark'" @click="execCommand('insertorderedlist')">
            <ion-icon slot="icon-only" :icon="listOutline" />
          </ion-button>
          <ion-button :color="currentStyle == 'insertunorderedlist' ? 'orange': 'dark'" @click="execCommand('insertunorderedlist')">
            <ion-icon slot="icon-only" :icon="listCircleOutline" />
          </ion-button>
          <ion-button @click="openDropup($event, 'font-size')">
            <ion-icon slot="icon-only" :icon="textOutline" />
          </ion-button>
          <ion-button :color="currentStyle == 'color' ? 'orange': 'dark'" @click="openDropup($event, 'color')">
            <ion-icon slot="icon-only" :icon="colorPaletteOutline" />
          </ion-button>
          <ion-button @click="openDropup($event, 'link')">
            <ion-icon slot="icon-only" :icon="linkOutline" />
          </ion-button>
          <ion-button @click="execCommand('undo')">
            <ion-icon slot="icon-only" :icon="arrowUndoOutline" />
          </ion-button>
          <ion-button @click="execCommand('redo')">
            <ion-icon slot="icon-only" :icon="arrowRedoOutline" />
          </ion-button>
          <ion-button @click="debug = !debug">
            <ion-icon slot="icon-only" :icon="bugOutline" />
          </ion-button>       
        </ion-buttons>
        <ion-buttons class="ion-no-padding ion-no-margin" slot="end">
          <ion-button v-bind="btnAttr" @click.stop="$emit('on-close')">
            <ion-icon slot="icon-only" :icon="returnUpBack" />
          </ion-button>
          <ion-button v-bind="btnAttr" @click.stop="$emit('on-toggle-private')">
            <ion-icon slot="icon-only" :icon="isPrivate ? lockClosedOutline : lockOpenOutline" />
          </ion-button>
          <ion-button v-bind="btnAttr" @click.stop="$emit('on-open-emoji')">
            <ion-icon slot="icon-only" :icon="happyOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </div>
    <div 
      id="chatWritter" 
      class="chat-writter p-4 min-h-24"
      contenteditable="true" 
      spellcheck="true"
      style="line-height: 20px;"
      @focus="onInputContent($event)"
      @input="onInputContent($event)">
    </div>
    <div class="p-1 bg-black text-white">
      Col : {{ caretPosition }} | Lignes : {{ lineCount }}
    </div>
  </div>
</div>
 
</template>

<script>
import { 
  defineComponent, 
  ref, 
  shallowRef,
  computed
} from 'vue'
import { debounce } from 'lodash'
import {
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel,
  IonText
} from '@ionic/vue'
import { 
  arrowUndoOutline,
  arrowRedoOutline,
  colorPaletteOutline,
  logOutOutline,
  logInOutline,
  bugOutline,
  documentText,
  listOutline,
  listCircleOutline,
  lockClosedOutline,
  lockOpenOutline,
  happyOutline,
  linkOutline,
  textOutline,
  returnUpBack
} from 'ionicons/icons'
import VColorPicker from '@/components/VColorPicker'
export default defineComponent({
  name: 'VChatWritter',
  emits: [
    'on-close',
    'on-submit',
    'on-typing',
    'on-change',
    'on-toggle-private',
    'on-open-emoji'
  ],
  components: {
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonLabel,
    IonText,
    VColorPicker
  },
  props: {
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const debug = ref(true)
    const tag = ref('div')
    const currentStyle = ref(null)
    const oldStyle = ref(null)
    const content = ref('')
    const selectedText = ref('')
    const chatWritter = ref(null)
    const enableToolbar = ref(true)
    const isOpenRef = ref(false)
    const currentComponent = shallowRef(null)
    const dropup = ref(null)
    const caretPosition = ref(0)
    const lineCount = ref(0)

    const update = async e => {
      content.value = e.target.innerHTML
      caretPosition.value = getCaretPosition(e)
      lineCount.value = getRowPosition(e)
    }

    const onInputContent = async e => {     
      await update(e)
      debounce(() => {
        emit('on-typing', content.value)     
      }, 250)
    }

    const openDropup = (event, action) => {
      event.preventDefault()
      isOpenRef.value = !isOpenRef.value
      if (isOpenRef.value) {
        oldStyle.value = currentStyle.value
        if (action == 'color') {
          currentStyle.value = 'color'
          currentComponent.value = VColorPicker
        // dropup.value.$el.classList.add('absolute z-50')
        }
      } else {
        currentComponent.value = null
      }   
    }

    const applyCommand = (payload) => {
     
      const selection = window.getSelection() 
      selectedText.value = selection.toString()

       console.info([
         currentStyle.value,
         payload,
         selectedText.value,
         formattedText(payload),
       ])
      // document.execCommand('insertHTML', false, formattedText(payload, action))
      let command = ''
      let value = ''
      if (currentStyle.value == 'color') {
        command = 'forecolor'
        value = payload.hex
      }
      if (command && value) {
        document.execCommand(command, false, value)
        // oldStyle.value = currentStyle.value
        // currentStyle.value = null
      } 
      selection.removeAllRanges()
      document.getElementById('chatWritter').focus()
      
      return
    }

    const formattedText = payload => {
      if (currentStyle.value == 'color') {
        return `<span style="color: ${payload.hex};">${selectedText.value}</span>`
      }
    }

    const execCommand = async action => {
      // @FIXME re-implement method to be compatible with Range and Selection
      const selection = window.getSelection() 
      selectedText.value = selection.toString()
      currentStyle.value = currentStyle.value != action ? action : '' // reset if toggle
      

      await execCommandCompatible(action, selection)
      // let formattedText = ''
      
      // document.execCommand('insertHTML', false, formattedText)
      // moveCaretAfterTag(selection.focusNode, selection, document.createRange())
      // document.execCommand(action, false, selectedText.value)

      // console.log('execCommand >> ', selection.anchorNode.parentNode.nodeName)
      // if (action == 'bold') {
      //   const tag = document.createElement("b")
      //   const tagReplace = document.createElement("span")
      //   tag.replaceWith(tagReplace)
      //   // formattedText = `<ol><li>${selectedText.value}</li></ol>`
      // } else if (action == 'insertorderedlist') {
      //   selection.anchorNode.parentNode.parentNode.classList = 'list-decimal my-2 ml-3'
      //   // formattedText = `<ol><li>${selectedText.value}</li></ol>`
      // } else if (action == 'insertunorderedlist') {
      //   selection.anchorNode.parentNode.parentNode.classList = 'list-disc my-2 ml-3'
      //   // formattedText = `<ul><li>${selectedText.value}</li></ul>`
      // } else if (action == 'blockquote') {
      //   selection.anchorNode.parentNode.classList = 'pl-2 border-l border-2'
      //   // formattedText = `<span class="font-bold">${selectedText.value}</span>`
      // }

      document.getElementById('chatWritter').focus()
    }

    const execCommandCompatible = async (action, selection) => {
      const el = document.getElementById('chatWritter')   
      if (selection.rangeCount && selection.toString()) {
        let range = selection.getRangeAt(0)
        const fragment = range.extractContents()
        range.collapse(false)
        // @refactor to method applyTailwindStyle
        let tagName = 'span'
        let taiwindClass
        if (action == 'bold') {
          taiwindClass = 'font-bold'
        } else if (action == 'italic') {
          taiwindClass = 'italic'
        } else if (action == 'underline') {
          taiwindClass = 'underline'
        } else if (action == 'strikeThrough') {
          taiwindClass = 'line-through'
        }
        // ---
        if (fragment.textContent?.length > 0) {
          const tag = document.createElement(tagName)
          tag.classList.add(taiwindClass)
          tag.appendChild(document.createTextNode(fragment.textContent))
          range.insertNode(tag)
          // range.surroundContents(tag)
          // Move the caret immediately after the inserted tag
          moveCaretAfterTag(tag, selection, range)
          el.focus()
        }
        // debug
        if (process.env.NODE_ENV != 'production') {
          console.log('action >> ', action)
          console.log('Selection >> ', selection)
          console.log('Range count >> ', selection.rangeCount)
          console.log('Range >> ', range)
          console.log('chatWritter >> ', chatWritter.value)
          console.log('innerText el >> ', el)
          console.log('fragment textContent >> ', fragment.textContent)
          console.log('selection window >> ', selectedText.value)
        }  
      }
    }

    const moveCaretAfterTag = (tag, selection, range) => {
      range = range.cloneRange()
      range.selectNodeContents(tag)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    const getRowPosition = event => {
      if (!document.getElementById('chatWritter')) {
        return 0
      } 

      const el = document.getElementById('chatWritter')   

      if (event) {
        console.log('getRowPosition' , el.innerText.split('\n').length)
      }

      const divHeight = el.offsetHeight - 32 // padding p-4
      const lineHeight = 24
      console.log('getRowPosition', [divHeight, lineHeight, el.offsetHeight])
      return Math.ceil((divHeight / lineHeight))   
    }

    const getCaretPosition = event => {
      if (event) {
        let pos = 0
        return pos
      }

      return 0
    }

    return {
      openDropup,
      dropup,
      debug,
      lineCount,
      caretPosition,
      getCaretPosition,
      currentComponent,
      isOpenRef,
      currentStyle,
      execCommand,
      execCommandCompatible,
      applyCommand,
      onInputContent,
      update,
      tag,
      selectedText,
      chatWritter,
      returnUpBack,
      enableToolbar,
      content,
      htmlContent: computed(() => content.value),
      documentText,
      arrowUndoOutline,
      arrowRedoOutline,
      lockClosedOutline,
      logOutOutline,
      lockOpenOutline,
      bugOutline,
      happyOutline,
      linkOutline,
      textOutline,
      listOutline,
      listCircleOutline,
      logInOutline,
      colorPaletteOutline,
      btnAttr: {
        size: 'small',
        color: 'orange'
      }
    }
  }
})
</script>
