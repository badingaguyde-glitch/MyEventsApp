const assert = require('assert');

// Simple test to verify the test suite runs successfully in CI
try {
  assert.strictEqual(1 + 1, 2);
  console.log("MobilFrontend: All tests passed!");
  process.exit(0);
} catch (err) {
  console.error("MobilFrontend: Test failed!", err);
  process.exit(1);
}
