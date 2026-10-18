$ErrorActionPreference = 'Stop'

$apiUrl = 'https://ai.zdzltop.com/v1/chat/completions'
$model = 'zdzl-chat'
$question = '讲述细胞的结构'
$keyText = 'JZR1:pZdbF0Rq+kR13E9K1bRvT0BEw5U0REYsDkxlfbwq+I71OkcTbteo1YchHVqKu3MtVTw9MTo7l/p71UaQiA3LJ3ZLsDEXcwX1QD0sAkRQXMg8X7u8uMfenzl'
$jzrKey = 'jiaozirui2025'
$alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
$payload = [ordered]@{
    model = $model
    messages = @(@{ role = 'user'; content = $question })
    stream = $false
    max_tokens = 1000
    temperature = 0.7
}
$jsonBody = $payload | ConvertTo-Json -Depth 10 -Compress

Write-Output "API 请求: POST $apiUrl"
Write-Output "请求正文: $jsonBody"

function Get-ApiKeyFromText([string]$Text) {
    $content = $Text.Trim()

    if ($content.StartsWith('JZR1:')) {
        $shuffled = $content.Substring(5)
        $base64 = [System.Text.StringBuilder]::new()
        foreach ($character in $shuffled.ToCharArray()) {
            $index = $alphabet.IndexOf($character)
            if ($index -ge 0) {
                $reverseIndex = ((($index - 13 + 64) % 64) * 55) % 64
                [void]$base64.Append($alphabet[$reverseIndex])
            } else {
                [void]$base64.Append($character)
            }
        }

        while (($base64.Length % 4) -ne 0) {
            [void]$base64.Append('=')
        }
        $bytes = [Convert]::FromBase64String($base64.ToString())
        $keyBytes = [System.Text.Encoding]::UTF8.GetBytes($jzrKey)
        for ($index = 0; $index -lt $bytes.Length; $index++) {
            $unmixed = (($bytes[$index] - ($index % 256) + 256) % 256)
            $bytes[$index] = [byte]($unmixed -bxor $keyBytes[$index % $keyBytes.Length])
        }

        try {
            $decoded = [System.Text.Encoding]::UTF8.GetString($bytes) | ConvertFrom-Json
        } catch {
            throw 'JZR1 解密失败：密文无效或内容不是合法 JSON。'
        }
        if ($decoded -is [string]) { return $decoded.Trim() }
        foreach ($property in @('api_key', 'key', 'token', 'api')) {
            $value = $decoded.$property
            if ($value) { return ([string]$value).Trim() }
        }
        throw 'JZR1 内容解密成功，但 JSON 中没有 api_key、key、token 或 api 字段。'
    }

    try {
        $json = $content | ConvertFrom-Json
        foreach ($property in @('api_key', 'apikey', 'key', 'token', 'apiKey', 'api')) {
            $value = $json.$property
            if ($value) { return ([string]$value).Trim() }
        }
    } catch {
        # 非 JSON 配置继续按项目中的明文格式解析。
    }

    $match = [regex]::Match($content, '(?:api[_-]?key|key|token|apikey)\s*[:=]\s*"?([A-Za-z0-9_\-.]+)"?', 'IgnoreCase')
    if ($match.Success) { return $match.Groups[1].Value }
    $match = [regex]::Match($content, 'Bearer\s+([A-Za-z0-9_\-.]+)', 'IgnoreCase')
    if ($match.Success) { return $match.Groups[1].Value }

    $line = $content -split '\r?\n' |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ -and -not $_.StartsWith('#') -and -not $_.StartsWith('//') } |
        Select-Object -First 1
    return [string]$line
}

Add-Type -AssemblyName System.Net.Http
$handler = [System.Net.Http.HttpClientHandler]::new()
$client = [System.Net.Http.HttpClient]::new($handler)
$client.Timeout = [TimeSpan]::FromSeconds(45)

try {
    Write-Output '使用提供的 JZR1 文本本地解密（不访问配置网页）'
    $apiKey = Get-ApiKeyFromText $keyText
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        throw '配置文件读取成功，但没有提取到 API Key。'
    }

    Write-Output "Authorization: Bearer [已隐藏]"
    Write-Output '正在发送 API 请求...'

    $request = [System.Net.Http.HttpRequestMessage]::new(
        [System.Net.Http.HttpMethod]::Post,
        $apiUrl
    )
    $request.Headers.Authorization =
        [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $apiKey)
    $request.Content = [System.Net.Http.StringContent]::new(
        $jsonBody,
        [System.Text.Encoding]::UTF8,
        'application/json'
    )

    $response = $client.SendAsync($request).GetAwaiter().GetResult()
    $responseText = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    Write-Output "HTTP 状态: $([int]$response.StatusCode) $($response.ReasonPhrase)"
    Write-Output 'API 响应正文:'
    if ($responseText) {
        try {
            $responseText | ConvertFrom-Json | ConvertTo-Json -Depth 20
        } catch {
            Write-Output $responseText
        }
    } else {
        Write-Output '(空响应)'
    }

    if ($response.IsSuccessStatusCode) {
        try {
            $data = $responseText | ConvertFrom-Json
            $reply = [string]$data.choices[0].message.content
            if ($reply) {
                Write-Output '提取到的 AI 回复:'
                Write-Output $reply
            } else {
                Write-Output 'HTTP 成功，但响应中没有 choices[0].message.content。'
            }
        } catch {
            Write-Output 'HTTP 成功，但响应正文不是预期的 Chat Completions JSON 格式。'
        }
    }
} catch {
    $rootCause = $_.Exception
    while ($rootCause.InnerException) { $rootCause = $rootCause.InnerException }
    Write-Error "$($_.Exception.Message) 根因：$($rootCause.Message)"
    exit 1
} finally {
    if ($request) { $request.Dispose() }
    $client.Dispose()
    $handler.Dispose()
}
