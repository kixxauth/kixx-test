import { describe } from 'kixx-test';
import { assertEqual } from 'kixx-assert';

// Let's create a simple game character class and test it:

class GameCharacter {
    constructor(name, health = 100, attackPower = 10, defense = 5) {
        this.name = name;
        this.health = health;
        this.attackPower = attackPower;
        this.defense = defense;
    }

    attack(target) {
        const damage = Math.max(0, this.attackPower - target.defense);
        target.health -= damage;
        return damage;
    }

    defend() {
        this.defense *= 1.5;
        return this.defense;
    }

    heal(amount = 20) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.health = Math.min(100, this.health + amount);
                resolve(this.health);
            }, 1000);
        });
    }
}

describe('GameCharacter', ({ describe }) => { // eslint-disable-line no-shadow
    describe('constructor', ({ it }) => {
        it('creates character with default values', () => {
            const hero = new GameCharacter('Hero');
            assertEqual('Hero', hero.name);
            assertEqual(100, hero.health);
            assertEqual(10, hero.attackPower);
            assertEqual(5, hero.defense);
        });

        it('creates character with custom values', () => {
            const boss = new GameCharacter('Boss', 200, 20, 10);
            assertEqual('Boss', boss.name);
            assertEqual(200, boss.health);
            assertEqual(20, boss.attackPower);
            assertEqual(10, boss.defense);
        });
    });

    describe('combat abilities', ({ before, it }) => {
        let attacker;
        let defender;

        before(() => {
            attacker = new GameCharacter('Attacker', 100, 15, 5);
            defender = new GameCharacter('Defender', 100, 10, 8);
        });

        it('can attack another character', () => {
            const damage = attacker.attack(defender);
            assertEqual(7, damage);
            assertEqual(93, defender.health);
        });

        it('cannot deal negative damage', () => {
            const weakling = new GameCharacter('Weakling', 100, 5, 5);
            const tank = new GameCharacter('Tank', 100, 10, 10);
            const damage = weakling.attack(tank);
            assertEqual(0, damage);
            assertEqual(100, tank.health);
        });

        it('can defend and increase defense', () => {
            const newDefense = defender.defend();
            assertEqual(12, newDefense);
            assertEqual(12, defender.defense);
        });
    });

    describe('healing abilities', ({ before, it }) => {
        let healer;

        before(() => {
            healer = new GameCharacter('Healer', 60);
        });

        it('can heal default amount', async () => {
            const newHealth = await healer.heal();
            assertEqual(80, newHealth);
            assertEqual(80, healer.health);
        });

        it('can heal custom amount', async () => {
            healer.health = 50;
            const newHealth = await healer.heal(30);
            assertEqual(80, newHealth);
            assertEqual(80, healer.health);
        });

        it('cannot heal beyond maximum health', async () => {
            healer.health = 90;
            const newHealth = await healer.heal();
            assertEqual(100, newHealth);
            assertEqual(100, healer.health);
        });
    });
});
