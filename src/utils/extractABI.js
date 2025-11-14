#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function printUsage() {
  console.log(`
Usage: node abi-to-ts.js <input-abi.json> <output-abi.ts>

Example:
  node scripts/abi-to-ts.js artifacts/contracts/SimpleYieldFarm.sol/SimpleYieldFarm.json src/contracts/SimpleYieldFarmABI.ts
`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('❌ Error: Please provide exactly two arguments.');
    printUsage();
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = path.resolve(args[1]);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // 读取并解析 JSON
  let abi;
  try {
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    // 兼容两种格式：
    // 1. { abi: [...], bytecode: ... }  ← Hardhat
    // 2. [...]                        ← 纯 ABI 数组
    abi = Array.isArray(data) ? data : data.abi;
    if (!Array.isArray(abi)) {
      throw new Error('ABI is not an array');
    }
  } catch (e) {
    console.error('❌ Failed to parse ABI:', e.message);
    process.exit(1);
  }

  // 过滤出 function（你也可以加上 event / error）
  const humanReadable = abi
    .filter((item) => item.type === 'function')
    .map((func) => {
      const name = func.name || '';
      const inputs =
        func.inputs
          ?.map((i) => `${i.type}${i.name ? ' ' + i.name : ''}`)
          .join(', ') || '';
      const outputs = func.outputs?.map((o) => o.type).join(', ') || '';
      const stateMut = func.stateMutability;

      let sig = `function ${name}(${inputs})`;
      if (stateMut === 'view' || stateMut === 'pure') {
        sig += ' view';
      } else if (stateMut === 'payable') {
        sig += ' payable';
      }
      // nonpayable: omit

      if (outputs) {
        sig += ` returns (${outputs})`;
      }

      return sig;
    });

  // 构建 TS 内容
  const tsContent = `// Auto-generated from ${path.basename(inputPath)}
// DO NOT EDIT MANUALLY

export const ${path.basename(outputPath, '.ts')} = [
${humanReadable.map((s) => `  "${s}"`).join(',\n')}
] as const;\n`;

  // 写入文件
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, tsContent);

  console.log(`✅ Successfully generated: ${outputPath}`);
}

main();
