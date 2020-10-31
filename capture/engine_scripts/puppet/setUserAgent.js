module.exports = async (page, scenario, vp) => {
  let isUserAgentChanges = false;
  if (vp.label === 'phone') {
    isUserAgentChanges = true;
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
  } else if (vp.label === 'tablet') {
    isUserAgentChanges = true;
    await page.setUserAgent('Mozilla/5.0 (iPad; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
  } else if (vp.label === 'desktop') {
    isUserAgentChanges = true;
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.100.0');
  }

  if (isUserAgentChanges) {
    console.log(`UserAgent changes to ${vp.label}`);
  }
};
