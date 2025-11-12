import fs from 'fs';

const data = JSON.parse(fs.readFileSync('../MyToken.json', 'utf8'));
const abi = data.abi;

const humanReadable = abi
  .filter(item => item.type === 'function')
  .map(func => {
    const name = func.name;
    const inputs = func.inputs.map(i => `${i.type}${i.name ? ' ' + i.name : ''}`).join(', ');
    const returns = func.outputs.map(o => o.type).join(', ');
    const stateMut = func.stateMutability;

    let sig = `function ${name}(${inputs})`;
    if (stateMut === 'view' || stateMut === 'pure') {
      sig += ' view';
    } else if (stateMut === 'payable') {
      sig += ' payable';
    }
    // nonpayable 可省略

    if (returns) {
      sig += ` returns (${returns})`;
    }

    return sig;
  });

const output = `export const MyTokenABI = [\n${humanReadable.map(s => `  "${s}"`).join(',\n')}\n];\n`;

fs.writeFileSync('../contracts/MyTokenABI.js', output);
console.log('✅ MyTokenABI.js generated!');