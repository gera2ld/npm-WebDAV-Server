import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/Resource'
import * as xml from 'xmlbuilder'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, resource) => {
        if(e || !resource)
        {
            arg.setCode(HTTPCodes.NotFound);
            callback();
            return;
        }

        const multistatus = xml.create('D:multistatus', ['xmlns:D="DAV:"'])

        resource.type((e, type) => {
            if(!type.isDirectory || arg.depth === 0)
            {
                addXMLInfo(resource, multistatus, () => done(multistatus))
                return;
            }
            
            resource.getChildren((e, children) => {
                let nb = children.length + 1;

                function nbOut()
                {
                    --nb;
                    if(nb === 0)
                        done(multistatus);
                }

                addXMLInfo(resource, multistatus, nbOut)
                
                children.forEach((child) => {
                    addXMLInfo(child, multistatus, nbOut)
                })
            })
        })

        function addXMLInfo(resource, multistatus, callback)
        {
            const response = multistatus.ele('D:response')

            const propstat = response.ele('D:propstat')

            propstat.ele('D:status', null, 'HTTP/1.1 200 OK')

            const prop = propstat.ele('D:prop')
            
            let nb = 7;
            function nbOut()
            {
                --nb;
                if(nb === 0)
                    callback();
            }

            resource.creationDate((e, ticks) => {
                prop.ele('D:creationdate', null, arg.dateISO8601(ticks));
                nbOut();
            })

            arg.getResourcePath(resource, (e, path) => {
                response.ele('D:href', null, arg.fullUri(path).replace(' ', '%20'));
                nbOut();
            })

            resource.webName((e, name) => {
                prop.ele('D:displayname', name);
                nbOut();
            })

            const supportedlock = prop.ele('D:supportedlock')
            resource.getAvailableLocks((e, lockKinds) => {
                lockKinds.forEach((lockKind) => {
                    const lockentry = supportedlock.ele('D:lockentry')

                    const lockscope = lockentry.ele('D:lockscope')
                    lockscope.ele('D:' + lockKind.scope.value.toLowerCase())

                    const locktype = lockentry.ele('D:locktype')
                    locktype.ele('D:' + lockKind.type.value.toLowerCase())
                })
                nbOut();
            })

            resource.getProperties((e, properties) => {
                for(const name in properties)
                {
                    const value = properties[name];
                    prop.ele(name, null, value)
                }
                nbOut();
            })

            resource.type((e, type) => {

                const resourcetype = prop.ele('D:resourcetype')
                if(type.isDirectory)
                    resourcetype.ele('D:collection')
                
                if(type.isFile)
                {
                    nb += 2;
                    resource.mimeType((e, mimeType) => {
                        prop.ele('D:getcontenttype', null, mimeType)
                        nbOut();
                    })
                    resource.size((e, size) => {
                        prop.ele('D:getcontentlength', null, size)
                        nbOut();
                    })
                }

                prop.ele('D:getetag', null, 'zzyzx')
                nbOut();
            })

            resource.lastModifiedDate((e, lastModifiedDate) => {
                prop.ele('D:getlastmodified', new Date(lastModifiedDate).toUTCString())
                nbOut();
            })
        }

        function done(multistatus)
        {
            const content = '<?xml version="1.0" encoding="utf-8" ?>\r\n' + multistatus.toString({pretty: false})
            arg.setCode(HTTPCodes.MultiStatus);
            arg.response.setHeader('Content-Type', 'text/xml; charset="utf-8"')
            arg.response.setHeader('Content-Length', content.length.toString())
            arg.response.write(content);
            callback();
        }
    })
}
