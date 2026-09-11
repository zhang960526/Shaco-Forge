using System.Security.Principal;
using System.Text.Json;
using ShacoForge.NativeCarrier;

internal static class IsolatedBoundary
{
    internal static void Run(string[] args)
    {
        if (args.Length != 3) throw new Exception("ISOLATED_ARGUMENTS_REJECTED");
        // Non-shipped fixture root outside the checkout's ancestor node_modules.
        string boundary = Path.GetFullPath(Path.Combine(Path.GetTempPath(), "shaco-forge-slice3-step2-runtime-tests"));
        string path = Path.GetFullPath(args[2]);
        bool Inside(string item) => item.Equals(boundary, StringComparison.OrdinalIgnoreCase)
            || item.StartsWith(boundary + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);
        if (!Path.IsPathFullyQualified(args[2]) || !Inside(path)) throw new Exception("ISOLATED_BOUNDARY_REJECTED");
        ProductHome.CheckAncestors(path);
        var sid = WindowsIdentity.GetCurrent().User!;
        object result;
        if (args[1] == "protect")
        {
            var missing = new Stack<string>();
            for (string? next = path; next is not null && Inside(next) && !Directory.Exists(next); next = Path.GetDirectoryName(next)) missing.Push(next);
            while (missing.Count != 0) ProductHome.CreatePrivate(missing.Pop());
            ProductHome.RequirePrivate(new DirectoryInfo(path));
            result = new { currentUserOnly = true };
        }
        else if (args[1] == "verify") result = ControlFilePrimitives.VerifyTree(path);
        else if (args[1] == "journal") result = ControlFilePrimitives.PublishJournal(path, Console.In.ReadToEnd());
        else if (args[1] == "capture") result = new { dacl = RuntimeFence.Capture(path, sid) };
        else if (args[1] == "apply") { RuntimeFence.Apply(path, sid); result = new { fenced = true }; }
        else if (args[1] == "fence-verify") { RuntimeFence.Verify(path, sid); result = new { fenced = true }; }
        else if (args[1] == "release") { RuntimeFence.Release(path, Console.In.ReadToEnd()); result = new { fenced = false }; }
        else if (args[1] is "processes" or "close-desktop") result = new { processCount = RuntimeFence.ProcessCount(path, args[1] == "close-desktop") };
        else throw new Exception("ISOLATED_OPERATION_REJECTED");
        Console.WriteLine(JsonSerializer.Serialize(result, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
