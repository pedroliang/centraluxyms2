const cp = require('child_process');
const token = process.env.SUPABASE_ACCESS_TOKEN;
const password = '&bh57%VckPAS9V&';
// Using spawnSync to bypass shell parsing issues with special characters in password
const result = cp.spawnSync('npx.cmd', ['supabase', 'link', '--project-ref', 'lbqprihivhehutomrzbr', '--password', password], {
  stdio: 'inherit',
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: token
  }
});
process.exit(result.status);
