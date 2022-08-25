from xmlrpc.server import SimpleXMLRPCDispatcher, SimpleXMLRPCRequestHandler
from argparse import ArgumentParser
import http.client
import xmlrpc.client
import socketserver
import socket
import os

from main import Plugin


class UnixStreamHTTPConnection(http.client.HTTPConnection):
    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(self.host)


class UnixStreamTransport(xmlrpc.client.Transport, object):
    def __init__(self, socket_path):
        self.socket_path = socket_path
        super().__init__()

    def make_connection(self, host):
        return UnixStreamHTTPConnection(self.socket_path)


class UnixStreamXMLRPCClient(xmlrpc.client.ServerProxy):
    def __init__(self, addr, **kwargs):
        transport = UnixStreamTransport(addr)
        super().__init__("http://", transport=transport, **kwargs)


class UnixStreamXMLRPCRequestHandler(SimpleXMLRPCRequestHandler):
    disable_nagle_algorithm = False

    def address_string(self):
        return self.client_address


class UnixStreamXMLRPCServer(
    socketserver.UnixStreamServer, SimpleXMLRPCDispatcher
):
    def __init__(
        self,
        addr,
        log_requests=True,
        allow_none=True,
        encoding=None,
        bind_and_activate=True,
        use_builtin_types=True,
    ):
        self.logRequests = log_requests
        SimpleXMLRPCDispatcher.__init__(
            self, allow_none, encoding, use_builtin_types
        )
        socketserver.UnixStreamServer.__init__(
            self,
            addr,
            UnixStreamXMLRPCRequestHandler,
            bind_and_activate,
        )


# Server is responsible for serving a Decky plugin via xmlrpc
class Server:
    def run(self, args):
        import asyncio

        # Convert the plugin's methods into syncronous methods
        class SyncPlugin(Plugin):
            def _dispatch(self, method, params):
                fn = getattr(self, method)
                res = fn(*params)
                if asyncio.iscoroutine(res):
                    return asyncio.get_event_loop().run_until_complete(res)
                return res

        # Create server
        with UnixStreamXMLRPCServer(args.socket) as srv:
            srv.register_introspection_functions()

            # Register an instance; all the methods of the instance are
            # published as XML-RPC methods (in this case, just 'mul').
            srv.register_instance(SyncPlugin())

            # Run the server's main loop
            srv.serve_forever()


# Client is responsible for calling plugin methods from the command-line
class Client:
    def run(self, args):
        # Try to cast to the correct type
        # TODO: this is brittle
        params = []
        for arg in args.params:
            if arg.isnumeric():
                params.append(int(arg))
                continue
            if is_float(arg):
                params.append(float(arg))
                continue
            params.append(arg)

        plugin = UnixStreamXMLRPCClient(args.socket)
        method = getattr(plugin, args.method)
        print(method(*params))


def is_float(element) -> bool:
    try:
        float(element)
        return True
    except ValueError:
        return False


if __name__ == "__main__":
    parser = ArgumentParser(description="Call plugin method")
    parser.add_argument(
        "-s",
        "--socket",
        type=str,
        help="unix socket to use for client/server",
        default="/tmp/plugin.sock",
    )
    subparsers = parser.add_subparsers(dest="subcommand", required=True)

    # Add server argument parser
    server_parser = subparsers.add_parser("server")

    # Add client argument parser
    client_parser = subparsers.add_parser("client")
    client_parser.add_argument("method", type=str, help="method to call")
    client_parser.add_argument(
        "params", metavar="N", nargs="*", help="method parameters"
    )

    args = parser.parse_args()

    if args.subcommand == "server":
        if os.path.exists(args.socket):
            os.remove(args.socket)
        server = Server()
        server.run(args)
    if args.subcommand == "client":
        client = Client()
        client.run(args)
