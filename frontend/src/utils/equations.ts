// import { Equation } from "@/types/game";

// // Generates a random integer between min and max (inclusive)
// const getRandomInt = (min: number, max: number): number => {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// };

// // Generates a unique ID
// const generateId = (): string => {
//   return Math.random().toString(36).substring(2, 10);
// };

// // Generates a random addition equation with values between 1-20
// const generateAddition = (): Equation => {
//   const num1 = getRandomInt(1, 20);
//   const num2 = getRandomInt(1, 20);
//   return {
//     id: generateId(),
//     question: `${num1} + ${num2} = ?`,
//     answer: num1 + num2
//   };
// };

// // Generates a random subtraction equation with a positive result
// const generateSubtraction = (): Equation => {
//   const answer = getRandomInt(1, 20);
//   const num2 = getRandomInt(1, 10);
//   const num1 = answer + num2;
//   return {
//     id: generateId(),
//     question: `${num1} - ${num2} = ?`,
//     answer
//   };
// };

// // Generates a random multiplication equation with factors between 1-12
// const generateMultiplication = (): Equation => {
//   const num1 = getRandomInt(1, 12);
//   const num2 = getRandomInt(1, 12);
//   return {
//     id: generateId(),
//     question: `${num1} × ${num2} = ?`,
//     answer: num1 * num2
//   };
// };

// // Generates a random division equation with integer results
// const generateDivision = (): Equation => {
//   const answer = getRandomInt(1, 10);
//   const num2 = getRandomInt(1, 10);
//   const num1 = answer * num2;
//   return {
//     id: generateId(),
//     question: `${num1} ÷ ${num2} = ?`,
//     answer
//   };
// };

// // Generates a random equation of any supported type
// export const generateEquation = (): Equation => {
//   const operationType = getRandomInt(1, 4);

//   switch (operationType) {
//     case 1:
//       return generateAddition();
//     case 2:
//       return generateSubtraction();
//     case 3:
//       return generateMultiplication();
//     case 4:
//       return generateDivision();
//     default:
//       return generateAddition();
//   }
// };

// // Generates a batch of random equations
// export const generateEquations = (count: number): Equation[] => {
//   const equations: Equation[] = [];
//   for (let i = 0; i < count; i++) {
//     equations.push(generateEquation());
//   }
//   return equations;
// };

// // Get a game code for multiplayer
// export const generateGameCode = (): string => {
//   return Math.random().toString(36).substring(2, 8).toUpperCase();
// };
