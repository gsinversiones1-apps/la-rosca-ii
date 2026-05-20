using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace FiscalBridge;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private HttpListener _listener;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
        _listener = new HttpListener();
        _listener.Prefixes.Add("http://localhost:8080/");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _listener.Start();
        _logger.LogInformation("🚀 SIMULADOR FISCAL ACTIVO: Escuchando en el puerto 8080...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try {
                HttpListenerContext context = await _listener.GetContextAsync();
                if (context.Request.IsWebSocketRequest)
                {
                    _ = ProcesarSocket(context);
                }
                else
                {
                    context.Response.StatusCode = 400;
                    context.Response.Close();
                }
            } catch (Exception ex) {
                _logger.LogError($"Error en el listener: {ex.Message}");
            }
        }
    }

    private async Task ProcesarSocket(HttpListenerContext context)
    {
        HttpListenerWebSocketContext wsContext = await context.AcceptWebSocketAsync(null);
        WebSocket webSocket = wsContext.WebSocket;
        _logger.LogInformation("✅ Cliente Node.js conectado.");

        byte[] buffer = new byte[1024 * 4];

        while (webSocket.State == WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Text)
            {
                string jsonString = Encoding.UTF8.GetString(buffer, 0, result.Count);
                try {
                    var data = JsonDocument.Parse(jsonString).RootElement;
                    ImprimirTicket(data);
                } catch {
                    _logger.LogError("❌ Error procesando el JSON recibido.");
                }
            }
        }
    }

    private void ImprimirTicket(JsonElement data)
    {
        string cliente = data.GetProperty("cliente").GetString() ?? "Generico";
        double pagoDivisas = data.GetProperty("pagoDivisas").GetDouble();
        double igtf = pagoDivisas * 0.03;

        Console.WriteLine("\n========================================");
        Console.WriteLine("       TORNILLERIA LA ROSCA II");
        Console.WriteLine("           TICKET FISCAL (SIM)");
        Console.WriteLine("========================================");
        Console.WriteLine($"CLIENTE: {cliente.ToUpper()}");
        Console.WriteLine("----------------------------------------");
        Console.WriteLine($"SUBTOTAL DIVISAS:    ${pagoDivisas:F2}");
        Console.WriteLine($"IGTF (3%):           ${igtf:F2}");
        Console.WriteLine("----------------------------------------");
        Console.WriteLine($"TOTAL A PAGAR:       ${(pagoDivisas + igtf):F2}");
        Console.WriteLine("========================================\n");
    }
}