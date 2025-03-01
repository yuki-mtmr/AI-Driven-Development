#!/usr/bin/env bun
import { cowsay } from './cowsay';
import { asciiArts, AnimalType } from './aa';

const message = process.argv[2] || "Hello, World!";
const animal = process.argv[3] as AnimalType || "cow";

if (process.argv[2] === "--list") {
    console.log("使用可能な動物一覧:");
    Object.entries(asciiArts).forEach(([key, value]) => {
        console.log(`- ${key}: ${value.name}`);
    });
} else if (animal && !asciiArts[animal]) {
    console.log(`エラー: "${animal}" は対応していません。`);
    console.log("--list オプションで使用可能な動物を確認できます。");
} else {
    cowsay(message, animal);
}