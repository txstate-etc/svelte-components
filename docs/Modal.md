# Modal
The Modal component is designed to block out the screen and focus the user on the content inside the Modal.

It provides only the backdrop and a scrollable container for your content. If your content should have a background color, be sure to add it yourself.

Any time the Modal is in the DOM, it will take over the screen. You make it go away by removing it from the DOM.

## Example Usage
```svelte
<script>
  let showMyModal = false
</script>
<button on:click={() => showMyModal = true}>Show Modal</button>
{#if showMyModal}
  <Modal on:escape={() => showMyModal = false}>
    This is a modal dialog!
  </Modal>
{/if}
<style>
  :global(.modal-container) { background: white; }
</style>
```
## Custom Events
* `on:escape` - dispatched when the user does something that would normally dismiss a modal, such as clicking in the darkened backdrop or pressing the Escape key. You should listen for this and dismiss your modal. If you do not listen for this event, users will only be able to escape by some other means provided within your content. Be careful not to trap them!

## Props
* `opaque: boolean` (default `false`) - Make the backdrop completely opaque so that it cannot be seen through. This is a more jarring experience for users but sometimes you don't want background content to be visible at all.
* `containerClass: string` (default `''`) - A class to be added to the scrollable container inside the backdrop. This container will always have the `.modal-container` class regardless of this prop.
* `escapable: boolean` (default `true`) - Let screen readers know that they can escape the modal by pressing the Escape key. If you are not listening for `on:escape` then you should set this `false` to avoid giving screen reader users false information.
* `hidefocus: boolean` (default `true`) - Focus must be moved to the modal when it opens, in order to maintain accessibility. This component avoids making the focus visible to users by default as it might be visually disconcerting. So on mount, focus is moved to an invisible element above your content. If you prefer focus to be visible to users, set this to `false` and focus will automatically be moved to the first element in your content that has a tabindex and therefore be visible to users. This prop is overridden if you provide an `initialfocus`.
* `hidefocuslabel: string` (default `focus is above modal dialog, start tabbing`) - The message that will be read out to users using a screen reader when the focus is on the invisible element created by the `hidefocus` prop.
* `initialfocus: string` (default `undefined`) - A selector to be used to locate and set focus on an element in your content, on mount. Use if you want focus on a specific element when the modal opens. Overrides `hidefocus`.
* `returnfocusto: HTMLElement` (default element that had focus was when modal opened) - Use to control where focus moves when the modal closes. If not provided, component automatically saves the element that had focus on mount. Usually it's the button that triggered the modal.

# FocusLock
The FocusLock component is for creating accessible modal dialogs that do not have a darkened backdrop. It shares many props and behaviors with Modal because the Modal component uses a FocusLock itself.

Any time the FocusLock is in the DOM, it will lock screen readers inside it. You release them by removing it from the DOM. Regular users are NOT trapped and may interact with other screen elements. When they do, the `escape` event will be fired, allowing you to remove the dialog.

FocusLocks can be nested. The user will be trapped inside the deepest FocusLock present in the DOM. When it goes away, they'll be trapped inside the previous FocusLock, and so on.

## Custom Events
* `on:escape` - dispatched when the user does something to dismiss the dialog, such as pressing the Escape key or clicking outside the dialog area. You should listen for this and remove the FocusLock. If you do not listen for this event, users will only be able to escape by some other means provided within your content. Be careful not to trap them!

## Example Usage
```svelte
<script>
  let showMyDialog = false
</script>
<button on:click={() => showMyDialog = true}>Show Dialog</button>
{#if showMyDialog}
  <FocusLock on:escape={() => showMyDialog = false}>
    Screen readers cannot escape this!
    <button on:click={() => showMyDialog = false}>Collapse Dialog</button>
  </FocusLock>
{/if}
```
## Props
* `escapable: boolean` (default `true`) - Controls whether the focus lock can be easily escaped by pressing the Escape key or clicking the invisible focus (see `hidefocus`). If you set this `false` you must provide a way to dismiss the lock inside your content or screen readers will be trapped.
* `hidefocus: boolean` (default `true`) - Focus must be moved to the modal when it opens, in order to maintain accessibility. This component avoids making the focus visible to users by default as it might be visually disconcerting. So on mount, focus is moved to an invisible element above your content. If you prefer focus to be visible to users, set this to `false` and focus will automatically be moved to the first element in your content that has a tabindex and therefore be visible to users. This prop is overridden if you provide an `initialfocus`.
* `hidefocuslabel: string` (default `focus is above modal dialog, start tabbing`) - The message that will be read out to users using a screen reader when the focus is on the invisible element created by the `hidefocus` prop.
* `initialfocus: string` (default `undefined`) - A selector to be used to locate and set focus on an element in your content, on mount. Use if you want focus on a specific element when the lock mounts. Overrides `hidefocus`.
* `returnfocusto: HTMLElement` (default element that had focus was when focuslock mounted) - Use to control where focus moves when the lock ends. If not provided, component automatically saves the element that had focus on mount. Usually it's the button that triggered the dialog.
