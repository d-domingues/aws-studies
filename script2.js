const args = process.argv.slice(2);

const flags = args.reduce((acc, arg, i) => {
  if (arg.startsWith('--')) {
    acc[arg.replace('--', '')] = args[i + 1];
  }
  return acc;
}, {});

console.log('Parsed Flags:', flags);

if (flags.name) {
  console.log(`Hello, ${flags.name}!`);
}

if (flags.age) {
  console.log(`You are ${flags.age} years old.`);
}
