using System.Configuration;
using System.Data;
using System.Windows;

namespace RedByte.Agent;

public partial class App : Application
{
    // Prevent from running the application twice or more
    private static Mutex _mutex = null;
    protected override void OnStartup(StartupEventArgs e)
    {
        const string appName = "RedByteAgentMutex";
        bool createdNew;
        _mutex = new Mutex(true, appName, out createdNew);

        if (!createdNew)
        {
            Application.Current.Shutdown();
            return;
        }

        base.OnStartup(e);
    }
}