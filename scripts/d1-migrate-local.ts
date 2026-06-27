import { seedWalkFromSql } from './seed-walk-from-sql.js';

seedWalkFromSql({ force: process.argv.includes('--force') });
