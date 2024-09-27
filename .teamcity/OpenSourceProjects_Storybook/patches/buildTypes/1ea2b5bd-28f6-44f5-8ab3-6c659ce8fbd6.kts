package OpenSourceProjects_Storybook.patches.buildTypes

import jetbrains.buildServer.configs.kotlin.v2017_2.*
import jetbrains.buildServer.configs.kotlin.v2017_2.ui.*

/*
This patch script was generated by TeamCity on settings change in UI.
To apply the patch, change the buildType with uuid = '1ea2b5bd-28f6-44f5-8ab3-6c659ce8fbd6' (id = 'OpenSourceProjects_Storybook_SmokeTests')
accordingly, and delete the patch script.
*/
changeBuildType("1ea2b5bd-28f6-44f5-8ab3-6c659ce8fbd6") {
    check(paused == false) {
        "Unexpected paused: '$paused'"
    }
    paused = true
}
