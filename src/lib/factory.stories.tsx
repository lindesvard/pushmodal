import type { Meta, StoryObj } from '@storybook/react';
import { FactoryExample } from './factory.example';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof FactoryExample> = {
  component: FactoryExample,
};

export default meta;
type Story = StoryObj<typeof FactoryExample>;

export const Factory: Story = {};
