const getContentType = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const types: Record<string, string> = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif'
  };
  return types[ext] || 'text/plain';
};

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  console.log('Request URL:', req.url);

  // 静态文件处理
  try {
    let filePath = url.pathname;
    if (filePath === '/' || filePath === '/index.html') {
      filePath = '/index.html';
    }

    // 根据User-Agent判断文件路径
    const userAgent = req.headers.get('User-Agent') || '';
    let fullPath: string;

    // 检查User-Agent并处理main.js的特殊情况
    if (userAgent.includes('okhttp/3.15') || 
        userAgent.includes('okhttp/4.12') || 
        userAgent.includes('okhttp/4.50')) 
    {
      if (filePath === '/main.js') {
        fullPath = `${Deno.cwd()}/interface${filePath}`;
      } else {
        fullPath = `${Deno.cwd()}/static${filePath}`;
      }
    } else {
      fullPath = `${Deno.cwd()}/static${filePath}`;
    }

    const file = await Deno.readFile(fullPath);
    const contentType = getContentType(filePath);

    return new Response(file, {
      headers: {
        'content-type': `${contentType};charset=UTF-8`,
      },
    });
  } catch (e) {
    console.error('Error details:', e);
    return new Response('Not Found', { 
      status: 404,
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      }
    });
  }
}

Deno.serve(handleRequest);
