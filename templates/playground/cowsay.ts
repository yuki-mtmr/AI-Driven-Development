import { asciiArts, AnimalType } from './aa';

export function cowsay(message: string = "Hello, World!", animal: AnimalType = "cow"): void {
    const { name, art } = asciiArts[animal];

    const border = '-'.repeat(message.length + 2);
    const speechBubble = `
 ${border}
< ${message} >
 ${border}
   -- ${name}`;

    console.log(`${speechBubble}\n${art}`);
}
