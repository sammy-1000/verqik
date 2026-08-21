import { loadEnvFiles } from './env';
import { runPrismaCommand } from './migrate';

loadEnvFiles();
runPrismaCommand(['generate']);
