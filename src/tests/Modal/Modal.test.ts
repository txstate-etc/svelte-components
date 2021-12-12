import '@testing-library/jest-dom'
import { fireEvent, render, waitFor } from '@testing-library/svelte'
import ModalTest from './ModalTest.svelte'

test('modal has a submit button', async () => {
  const { queryByText } = render(ModalTest)
  expect(queryByText('Submit')).toBeInTheDocument()
})

test('modal can be dismissed', async () => {
  const { queryByText } = render(ModalTest)

  const button = queryByText('Submit')
  expect(button).not.toBeNull()
  await fireEvent.keyDown(button!, { key: 'Escape' })
  await waitFor(async () => expect(queryByText('Submit')).toBeNull())
})
