import { describe } from 'kixx-test';
import { assertEqual } from 'kixx-assert';

describe('Basic Test Example', ({ it }) => {

    it('can perform simple assertions', () => {
        const value = 42;
        assertEqual(42, value);
    });

    it('can test async code', async () => {
        const result = await Promise.resolve('async result');
        assertEqual('async result', result);
    });
});

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

describe('GameCharacter', ({ it }) => {
    it('can create a character with default values', () => {
        const hero = new GameCharacter('Hero');
        assertEqual('Hero', hero.name);
        assertEqual(100, hero.health);
        assertEqual(10, hero.attackPower);
        assertEqual(5, hero.defense);
    });

    it('can create a character with custom values', () => {
        const boss = new GameCharacter('Boss', 200, 20, 10);
        assertEqual('Boss', boss.name);
        assertEqual(200, boss.health);
        assertEqual(20, boss.attackPower);
        assertEqual(10, boss.defense);
    });

    it('can attack another character', () => {
        const attacker = new GameCharacter('Attacker', 100, 15, 5);
        const defender = new GameCharacter('Defender', 100, 10, 8);

        const damage = attacker.attack(defender);
        assertEqual(7, damage); // 15 attack - 8 defense = 7 damage
        assertEqual(93, defender.health); // 100 - 7 = 93
    });

    it('can defend and increase defense', () => {
        const knight = new GameCharacter('Knight');
        const newDefense = knight.defend();

        assertEqual(7.5, newDefense); // 5 * 1.5 = 7.5
        assertEqual(7.5, knight.defense);
    });

    // Test blocks can by asynchronous
    it('can heal over time', async () => {
        const patient = new GameCharacter('Patient', 80);
        const newHealth = await patient.heal();

        assertEqual(100, newHealth);
        assertEqual(100, patient.health);
    });

    // Test blocks can by asynchronous
    it('can heal within maximum health limit', async () => {
        const healer = new GameCharacter('Healer', 90);
        const newHealth = await healer.heal();

        assertEqual(100, newHealth); // Heals 20 but caps at 100
        assertEqual(100, healer.health);
    });

    // Test blocks can by asynchronous
    it('can heal with custom amount', async () => {
        const wounded = new GameCharacter('Wounded', 50);
        const newHealth = await wounded.heal(30);

        assertEqual(80, newHealth);
        assertEqual(80, wounded.health);
    });
});


