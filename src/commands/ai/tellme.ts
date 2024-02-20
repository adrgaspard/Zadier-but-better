import type { Command } from '@commands';
import { SlashCommandBuilder } from 'discord.js';

import { replicate } from './replicate';

const PROMPT_TEMPLATE = `<s>[INST] le bon niveau en algo te permet d'optimiser des programmes
un bon niveau en maths... bon
et les maths complexes en entreprise, ça va probablement représenter 0.00001% de ce que tu vas faire [/INST]
Tu dis probablement ça parce que tu n'as pas un niveau suffisant en maths pour vraiment pouvoir les utiliser abondamment.

Mais par contre, je reste d'accord, l'algo c'est plus important, les maths c'est un plus.</s>
[INST] perso dans le cadre spécifique du web osef d'apprendre un langage qui te montre les pointeurs etc
tu n'as pas besoin d'apprendre le latin pour parler français [/INST] 
Je suis d'accord, c'est pour ça que je n'ai pas spécifié de langage.
Je pense toujours qu'un des meilleurs langages à apprendre c'est le C, mais je suis d'accord que c'est complètement overkill pour du web.

Après je suis d'accord avec les autres  python semble être un bon compromis, c'est très facile et c'est plus rigoureux que php ou js.
En particulier je pense que ça aide mieux à comprendre que les variables sont typées</s>
[INST] "Apprendre la logique" tu me diras à quel moment j'ai parler de logique stp, j'ai parler des structures de données et d'algorithme. Je fais un exemple, admettons tu apprends le python ça sert à quoi si tu ne sais pas structurer ton programme, te servir des boucles principales ? Bref les choses essentiels et qui te serviront partout. Ensuite "Je crois que pour apprendre à coder, on a quand même besoin de pratiquer un langage pour comprendre les concepts." Oui pour toi pratiquer un langage peut te faire comprendre CERTAINS concept mais tu peux très vite passé à côté de ce qui est fondamental (modifié)
Et dans son cas en plus, tu lui conseille de pratiquer un langage mais si elle souhaite découvrir ce domaine, conseiller un langage (de ce que j'en pense) ce n'est pas la meilleure idée [/INST]
Tu as littéralement parlé de logique dans le message qui suit celui où tu parles des structures de données et de l'algorithmique.
J'ai bien compris que tu utilisais le terme "logique" pour regrouper ces 2 termes et même si ça peut se questionner, je l'ai réutilisé tel quel.
Ne soit pas agressif, on peut débattre sur le fond sans s'embrouiller sur les mots 😉

D'autant que je suis un matheux, que je suis partisan de l'apprentissage poussé de la théorie, c'est d'ailleurs les études que j'ai fait.

Mais il y a une différence entre suivre un cours et apprendre par soi-même.

Et je reste convaincu qu'il est quasiment impossible d'apprendre l'algorithmique par soi-même sans s'appuyer sur un langage pour pouvoir lancer son code et visualiser ce que l'on apprend.

Et même avec un prof, il faut un esprit très matheux pour faire de l'algèbre de bool et de l'algorithmique théorique sans visualiser tout cela à travers l'informatique.

Je ne dis pas que ce n'est pas intéressant, au contraire, j'adore ça, mais ça requiert un esprit bien plus mathématique que ce qui est nécessaire pour faire du web.

En particulier le web est un domaine très spécial. Une bonne partie du web ne s'apparente même pas à de la programmation et de manière générale, l'algorithmique ne représente pas la majorité du travail, même en développement backend.
Je reste convaincu qu'il faut l'apprendre avant de commencer, ne serait-ce que pour savoir ce que l'on aime faire.
Mais si l'objectif c'est le web, le chemin théorique me paraît être la bonne façon de se décourager.

À l'inverse, l'apprentissage d'un langage permet de comprendre beaucoup de concepts, qu'il aura tout le loisir d'agrémenter de mathématiques si finalement ce n'est pas tant le web qui l'intéresse dans la programmation.</s>
[INST] {prompt} [/INST]`;

export const TELLME: Command = {
    data: new SlashCommandBuilder()
        .setName('tellme')
        .setDescription("Demande à Zadier ce qu'il en pense")
        .addStringOption((option) => option.setName('prompt').setDescription('Le prompt').setRequired(true))
        .addNumberOption((option) =>
            option
                .setName('max_new_tokens')
                .setDescription('Le nombre maximum de jetons que le modèle doit générer en sortie (1024 par défaut)')
                .setMinValue(0)
                .setMaxValue(10000)
                .setRequired(false),
        ),
    execute: async (interaction) => {
        await interaction.deferReply();
        const input = {
            prompt: interaction.options.get('prompt')?.value as string,
            max_new_tokens: (interaction.options.get('max_new_tokens')?.value as number) || 1024,
            temperature: 0.6,
            top_p: 0.9,
            top_k: 50,
            presence_penalty: 0,
            frequency_penalty: 0,
            prompt_template: PROMPT_TEMPLATE,
        };
        let msg = '';
        let last_time = Date.now();
        for await (const event of replicate.stream('mistralai/mixtral-8x7b-instruct-v0.1', { input })) {
            if (event.event === 'output') {
                msg += event.data;
            }
            if (Date.now() - last_time > 500 && msg !== '') {
                await interaction.editReply(msg);
                last_time = Date.now();
            }
        }
        await interaction.editReply(msg);
    },
};
