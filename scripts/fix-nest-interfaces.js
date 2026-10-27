import fs from 'fs';
import path from 'path';

const base = path.join('node_modules', '@nestjs', 'common');
if (fs.existsSync(base)) {
  const jsFile = path.join(base, 'interfaces.js');
  const dtsFile = path.join(base, 'interfaces.d.ts');

  if (!fs.existsSync(jsFile)) {
    fs.writeFileSync(jsFile, "export * from './interfaces/index.js';\n");
  }
  if (!fs.existsSync(dtsFile)) {
    fs.writeFileSync(dtsFile, "export * from './interfaces/index.d.ts';\n");
  }
  console.log('✔ @nestjs/common/interfaces resolved for Nest 12 / Swagger compatibility');
}
