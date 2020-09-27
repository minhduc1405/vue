<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

@Component(
  { name: "Modal" }
)
export default class Modal extends Vue {
  public visible = false;
  public visibleAnimate = false;

  beforeDestroy() {
    // Prevent modal from not executing its closing actions if the user navigated away (for example,
    // through a link).
    this.close();
  }

  open(): void {
    document.body.style.overflow = 'hidden';
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 200);
  }

  close(): void {
    document.body.style.overflow = 'auto';
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 100);
  }

  onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('modal')) {
      this.close();
    }
  }

}
</script>
<template>
  <div role="dialog"
       @click='onContainerClicked'
       class="modal-portal"
       tabindex="-1"
       v-bind:class="{'in': visibleAnimate }"
       v-bind:style="{'display': visible ? 'block' : 'none', 'opacity': visibleAnimate ? 1 : 0}"
       v-if="visible">
    <div class="modal-portal-backdrop">
      <div class="modal-portal-content">
        <div class="view-container">
          <slot name="header"></slot>
        </div>
        <slot name="body"></slot>
      </div>
    </div>
  </div>
</template>
